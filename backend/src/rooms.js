const ShortUniqueId = require("short-unique-id");
const { getTrack, pingToken, putInQueue } = require("./spotify");
const seconds2closeroom = 40 * 60;

class RoomGroup {
  constructor() {
    this.uid = new ShortUniqueId({
      dictionary: [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ],
    });

    this.rooms = {};
    this.roomOwners = {};
    this.roomParticipants = {};

    // Store tokens from users. and if they reconnect, give them their old room back
    this.hostTokens = {};
    this.startuidlength = 4;
  }

  getRoom(id) {
    return this.rooms[id];
  }

  getRoomId() {
    let id = this.uid.randomUUID(this.startuidlength);
    let tries = 0;
    while (this.rooms[id]) {
      id = this.uid.randomUUID(this.startuidlength + tries / 3);
      tries++;
    }
    return id;
  }

  async createRoom(creatorId, token) {
    if (this.roomOwners[creatorId] || this.roomParticipants[creatorId])
      return false;

    if (!(await pingToken(token))) return false;

    // If token is already in use, we just asume, the person just refreshed the page
    const existingRoom = this.hostTokens[token];
    // no need to create a room
    // TODO:
    if (existingRoom) {
      clearTimeout(this.rooms[existingRoom].timeoutToClose);

      const previousOwner = this.rooms[existingRoom].host;
      delete this.roomOwners[previousOwner];

      // update exising room with new host socket.id
      this.rooms[existingRoom].host = creatorId;
      this.roomOwners[creatorId] = this.rooms[existingRoom].roomId;

      return existingRoom;
    }

    const roomId = this.getRoomId();
    this.rooms[roomId] = {
      host: creatorId,
      token,
      roomId,
      guests: {},
      queue: [],
      deviceId: null,
      timeoutToClose: null,
    };

    this.roomOwners[creatorId] = roomId;
    this.hostTokens[token] = roomId;

    return roomId;
  }

  probeRoom(roomId, askingId) {
    if (!this.rooms[roomId] || this.roomOwners[askingId]) return false;
    return true;
  }

  joinRoom(roomId, personId) {
    if (!this.probeRoom(roomId, personId)) return false;

    this.rooms[roomId].guests[personId] = true;
    this.roomParticipants[personId] = roomId;

    return this.rooms[roomId];
  }

  async putInQueue(song, personId) {
    try {
      const roomId = this.roomParticipants[personId];

      if (!roomId) return false;

      const room = this.rooms[roomId];
      const token = room.token;

      // if it's not a valid track getTrack throws an error
      const track = await getTrack(token, song);
      await putInQueue(token, song, room.deviceId);

      const track_json = {
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "),
        picture: track.album.images[1].url,
      };

      room.queue.push(track_json);

      return [roomId, track_json];
    } catch (error) {
      console.log(error);
      return [false, null];
    }
  }

  closeRoom(roomId, personId) {
    console.log("inside closing room");
    for (const guest of Object.keys(this.rooms[roomId].guests))
      delete this.roomParticipants[guest];

    const roomToken = this.rooms[roomId].token;
    delete this.hostTokens[roomToken];
    delete this.rooms[roomId];
    delete this.roomOwners[personId];
  }

  // TODO: if host disconnects, maybe no need to close the room
  leaveRoom(personId) {
    return new Promise((resolve, reject) => {
      if (this.roomOwners[personId]) {
        const roomId = this.roomOwners[personId];

        const timeout = setTimeout(() => {
          this.closeRoom(roomId, personId);
          resolve(["owner", roomId, null]);
        }, 1000 * seconds2closeroom);

        this.rooms[roomId].timeoutToClose = timeout;
      } else if (this.roomParticipants[personId]) {
        const roomId = this.roomParticipants[personId];

        delete this.rooms[roomId].guests[personId];
        delete this.roomParticipants[personId];

        resolve(["participant", roomId, this.rooms[roomId].guests]);
      } else {
        resolve([null, null, null]);
      }
    });
  }

  updatePlayingDevice(deviceId, personId) {
    if (!deviceId) return;

    const roomId = this.roomOwners[personId];

    if (!roomId) return;

    this.rooms[roomId].deviceId = deviceId;
  }
}

module.exports = RoomGroup;
