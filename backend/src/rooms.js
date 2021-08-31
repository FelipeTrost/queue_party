const ShortUniqueId = require("short-unique-id");
const { encrypt, decrypt } = require("./encryption");
const {
  getTrack,
  pingToken,
  putInQueue,
  getToken,
  getPlayingId,
} = require("./spotify");
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
    this.hostIdentifiers = {};
    this.startuidlength = 3;
    this.roomUpdaters = {};
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

  joinRoomHost(creatorId, secret, emit) {
    if (this.roomParticipants[creatorId])
      return new Error("You're a room participant");

    const roomId = this.secretToRoom(secret);

    if (!this.rooms[roomId]) return new Error("No room under given id");

    if (this.rooms[roomId].host)
      return new Error("This account already has an active room");

    // putting this here isn't really that good, but it works for nowj
    if (!this.roomUpdaters[roomId].updaterId)
      this.roomUpdaters[roomId].updaterId = this.queueUpdater(roomId, emit);

    clearTimeout(this.rooms[roomId].timeoutToClose);

    // update exising room with new host socket.id
    this.rooms[roomId].host = creatorId;
    this.roomOwners[creatorId] = roomId;

    return roomId;
  }

  queueUpdater(roomId, emit) {
    return setInterval(async () => {
      try {
        const room = this.rooms[roomId];

        // if there isn't anything in the queue there is no need to check
        if (!room.queue.length) return;

        const token = await getToken(room.tokens);
        const id = await getPlayingId(token);

        // So that we don't delete things twice, can cause problems if a song
        // comes twice in a row, but it's better this way
        if (this.roomUpdaters[roomId].lastDeleted === id) return;

        // find first id match in queue
        let end = 0;
        let found = false;
        for (let index = 0; index < room.queue.length; index++) {
          if (room.queue[index].id == id) {
            end = index;
            found = true;

            // We just take the first match
            break;
          }
        }

        if (found) {
          // delete elements until match
          room.queue.splice(0, end + 1);
          emit(room.queue);

          // save deleted id
          this.roomUpdaters[roomId].lastDeleted = id;
        }
      } catch (error) {
        console.log(error);
      }
    }, 2000);
  }

  async createRoom(tokens, spotifyIdentifier) {
    if (!tokens || !(await pingToken(tokens.access_token)))
      return new Error("Invalid spotify authorization");

    // If token is already in use, we just asume, the person just refreshed the page
    // no need to create a room
    const existingRoom = this.hostIdentifiers[spotifyIdentifier];
    if (existingRoom) return this.roomToSecret(existingRoom);

    const roomId = this.getRoomId();

    this.rooms[roomId] = {
      host: undefined,
      tokens,
      roomId,
      spotifyIdentifier,
      guests: {},
      queue: [],
      deviceId: null,
      timeoutToClose: null,
    };

    this.hostIdentifiers[spotifyIdentifier] = roomId;

    // putting this here isn't really that good, but it works for nowj
    this.roomUpdaters[roomId] = { lastDeleted: null };

    return this.roomToSecret(roomId);
  }

  probeRoom(roomId, askingId) {
    if (!this.rooms[roomId] || this.roomOwners[askingId]) return false;
    return true;
  }

  joinRoom(roomId, personId) {
    if (!this.probeRoom(roomId, personId))
      return new Error("Room doesn't exist");

    this.rooms[roomId].guests[personId] = true;
    this.roomParticipants[personId] = roomId;

    return this.rooms[roomId];
  }

  async putInQueue(song, personId) {
    try {
      const roomId = this.roomParticipants[personId];

      if (!roomId) return [new Error("You're not part of any room"), null];

      const room = this.rooms[roomId];
      const token = await getToken(room.tokens);

      // if it's not a valid track getTrack throws an error
      const track = await getTrack(token, song);
      await putInQueue(token, song, room.deviceId);

      const track_json = {
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "),
        picture: track.album.images[1].url,
        id: track.id,
      };

      room.queue.push(track_json);

      return [roomId, track_json];
    } catch (error) {
      return [error, null];
    }
  }

  closeRoom(id, isPerson) {
    let roomId;
    if (isPerson) {
      roomId = this.roomOwners[id];
    } else {
      roomId = id;
    }

    if (!roomId) return new Error("You don't own a room");

    clearInterval(this.roomUpdaters[roomId].updaterId);
    delete this.roomUpdaters[roomId];

    for (const guest of Object.keys(this.rooms[roomId].guests))
      delete this.roomParticipants[guest];

    const identifier = this.rooms[roomId].spotifyIdentifier;
    delete this.hostIdentifiers[identifier];

    delete this.rooms[roomId];
    if (isPerson) delete this.roomOwners[id];

    return roomId;
  }

  // TODO: if host disconnects, maybe no need to close the room
  leaveRoom(personId) {
    return new Promise((resolve, reject) => {
      if (this.roomOwners[personId]) {
        const roomId = this.roomOwners[personId];

        // clear person from data structures
        delete this.roomOwners[personId];
        this.rooms[roomId].host = undefined;

        // Set timeout for closing room
        const timeout = setTimeout(() => {
          this.closeRoom(roomId, false);
          resolve(["owner", roomId, null]);
        }, 1000 * seconds2closeroom);

        // save timeout id inside room struct
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

  roomToSecret(roomId) {
    const encrypted = encrypt(roomId);
    return Buffer.from(encrypted).toString("base64");
  }

  secretToRoom(secret) {
    const realSecret = Buffer.from(secret, "base64").toString("ascii");
    return decrypt(realSecret);
  }
}

module.exports = RoomGroup;
