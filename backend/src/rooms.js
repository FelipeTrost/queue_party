const ShortUniqueId = require("short-unique-id");
const { getTrack, pingToken, putInQueue } = require("./spotify");

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

    const roomId = this.getRoomId();
    this.rooms[roomId] = {
      host: creatorId,
      token,
      roomId,
      guests: {},
      queue: [],
      deviceId: null,
    };

    this.roomOwners[creatorId] = roomId;

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

  leaveRoom(personId) {
    if (this.roomOwners[personId]) {
      const roomId = this.roomOwners[personId];

      for (const guest of Object.keys(this.rooms[roomId].guests))
        delete roomParticipants[guest];

      delete this.rooms[roomId];
      delete this.roomOwners[personId];

      return ["owner", roomId, null];
    } else if (this.roomParticipants[personId]) {
      const roomId = this.roomParticipants[personId];

      delete this.rooms[roomId].guests[personId];
      delete this.roomParticipants[personId];

      return ["participant", roomId, this.rooms[roomId].guests];
    }

    return [null, null];
  }

  updatePlayingDevice(deviceId, personId) {
    if (!deviceId) return;

    const roomId = this.roomOwners[personId];

    if (!roomId) return;

    this.rooms[roomId].deviceId = deviceId;
  }
}

module.exports = RoomGroup;
