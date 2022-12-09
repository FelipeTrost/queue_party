const ShortUniqueId = require("short-unique-id");
const validRoomName = require("../../sharedUtils/validRoomName");
const { encrypt, decrypt } = require("./encryption");
const {
  getTrack,
  pingToken,
  putInQueue,
  getToken,
  getPlayingId,
} = require("./spotify");
const seconds2closeroom = process.env.SECONDS_TO_CLOSE || 60;

function noRoomError(message) {
  const error = new Error(message);
  error.noRoom = true;
  return error;
}

class RoomGroup {
  constructor() {
    this.uid = new ShortUniqueId({
      dictionary: "0123456789abcdef".split(""),
    });

    this.rooms = {};
    this.roomNameToRoom = {};
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

  joinRoomHost(hostId, secret, emit) {
    // creatorId would be a socket id
    if (this.roomParticipants[hostId])
      return new Error("You're a room participant");

    const roomId = this.secretToRoom(secret);

    if (!this.rooms[roomId]) return noRoomError("No room under given id");

    if (this.rooms[roomId].host)
      return new Error("This account already has an active room");

    // putting this here isn't really that good, but it works for nowj
    if (!this.roomUpdaters[roomId].updaterId)
      this.roomUpdaters[roomId].updaterId = this.queueUpdater(roomId, emit);

    clearTimeout(this.rooms[roomId].timeoutToClose);

    // update exising room with new host socket.id
    const room = this.rooms[roomId];

    room.host = hostId;
    this.roomOwners[hostId] = roomId;

    return room;
  }

  joinRoom(roomName, personId) {
    // personId would be a socket id
    if (!this.probeRoom(roomName, personId))
      return noRoomError("Room doesn't exist");

    const roomId = this.roomNameToRoom[roomName];

    this.rooms[roomId].guests[personId] = true;
    this.roomParticipants[personId] = roomId;

    return this.rooms[roomId];
  }

  togglePermanentRoom(hostId, value) {
    if (this.roomParticipants[hostId])
      return new Error("You're a room participant");

    const roomId = this.roomOwners[hostId];

    this.rooms[roomId].permanentRoom = value;

    // A bit redundant, because if host is logged in there shouldn;t be a timeout, but just to sure
    if (value) clearTimeout(this.rooms[roomId].timeoutToClose);
  }

  // Updates queue status for room participants
  // emit -> function to send information to participants
  queueUpdater(roomId, emit) {
    return setInterval(async () => {
      try {
        const room = this.rooms[roomId];

        // if there isn't anything in the queue there is no need to check
        if (!room.queue.length) return;

        const token = await getToken(room.tokens);
        const id = await getPlayingId(token);
        const track = await getTrack(token, `spotify:track:${id}`);
        const track_json = {
          name: track.name,
          artist: track.artists.map((artist) => artist.name).join(", "),
          picture: track.album.images[1].url,
          id: track.id,
        };
        emit(roomId, "current-song", track_json);

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
          emit("new-queue", room.queue);

          // save deleted id
          this.roomUpdaters[roomId].lastDeleted = id;
        }
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  }

  setRoomName(hostId, roomName) {
    const roomId = this.roomOwners[hostId];
    if (!roomId) return new Error("You're not a host of any room");

    const room = this.rooms[roomId];
    if (room.roomNameSet) return new Error("Room name already set");

    // Check if custom name is available and valid
    if (!roomName) {
      roomName = this.getRoomName();
    } else {
      const validation = validRoomName(roomName);

      if (this.roomNameToRoom[roomName] !== undefined)
        return new Error("Name already in use");
      //
      else if (!validation.ok)
        return new Error(`Not a valid room name: ${validation.message}`);
    }

    room.roomNameSet = true;
    room.roomName = roomName;
    this.roomNameToRoom[roomName] = roomId;

    return room;
  }

  async createRoom(tokens, spotifyIdentifier) {
    if (!tokens || !(await pingToken(tokens.access_token)))
      return new Error("Invalid spotify authorization");

    // If token is already in use, we just asume, the person just refreshed the page
    // no need to create a room
    const existingRoom = this.hostIdentifiers[spotifyIdentifier];
    if (existingRoom) return this.roomToSecret(existingRoom);

    const roomId = this.getRoomId(); // Internal room id

    this.rooms[roomId] = {
      host: undefined,
      roomId,
      tokens,
      spotifyIdentifier,
      roomName: null,
      roomNameSet: false,
      guests: {},
      queue: [],
      deviceId: null,
      timeoutToClose: null,
      permanentRoom: false,
    };

    this.hostIdentifiers[spotifyIdentifier] = roomId;

    // putting this here isn't really that good, but it works for nowj
    this.roomUpdaters[roomId] = { lastDeleted: null };

    return this.roomToSecret(roomId);
  }

  probeRoom(roomName, askingId) {
    // Asking id would be a socket id
    const roomId = this.roomNameToRoom[roomName];
    if (!roomId || !this.rooms[roomId] || this.roomOwners[askingId])
      return false;
    return true;
  }

  async putInQueue(song, personId) {
    try {
      const roomId =
        this.roomParticipants[personId] || this.roomOwners[personId];

      if (!roomId) return [noRoomError("You're not part of any room"), null];

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

    const roomName = this.rooms[roomId].roomName;
    delete this.roomNameToRoom[roomName];

    // remove participants
    for (const guest of Object.keys(this.rooms[roomId].guests))
      delete this.roomParticipants[guest];

    const identifier = this.rooms[roomId].spotifyIdentifier;
    delete this.hostIdentifiers[identifier];

    delete this.rooms[roomId];
    if (isPerson) delete this.roomOwners[id];

    return roomId;
  }

  // TODO: if host disconnects, maybe no need to close the room
  leaveRoom(personId, leaveRoom) {
    return new Promise((resolve, reject) => {
      if (this.roomOwners[personId]) {
        const roomId = this.roomOwners[personId];
        leaveRoom(roomId);

        // clear person from data structures
        delete this.roomOwners[personId];
        this.rooms[roomId].host = undefined;

        // only set timeout to close room if it isn't permanent
        if (!this.rooms[roomId].permanentRoom) {
          // Set timeout for closing room
          const timeout = setTimeout(() => {
            this.closeRoom(roomId, false);
            resolve(["owner", roomId, null]);
          }, 1000 * seconds2closeroom);

          // save timeout id inside room struct
          this.rooms[roomId].timeoutToClose = timeout;
        }
      } else if (this.roomParticipants[personId]) {
        const roomId = this.roomParticipants[personId];
        leaveRoom(roomId);

        delete this.rooms[roomId].guests[personId];
        delete this.roomParticipants[personId];

        resolve(["participant", roomId, this.rooms[roomId].guests]);
      } else {
        resolve([null, null, null]);
      }
    });
  }

  // ------------------
  // UTILS
  // ------------------

  getId(startLength, usedUids) {
    let id = this.uid.randomUUID(startLength);
    let tries = 0;
    while (usedUids[id]) {
      id = this.uid.randomUUID(startLength + tries / 3);
      tries++;
    }
    return id;
  }

  getRoomId() {
    return this.getId(10, this.rooms);
  }

  getRoomName() {
    return this.getId(this.startuidlength, this.roomNameToRoom);
  }

  roomToSecret(roomId) {
    const identifier = this.rooms[roomId].spotifyIdentifier;
    const secret = JSON.stringify({
      // roomId, we no longer put the roomId in, because it isn't determined at the moment of creation
      identifier,
    });

    const encrypted = encrypt(secret);
    return Buffer.from(encrypted).toString("base64");
  }

  secretToRoom(input) {
    try {
      const encrypted = Buffer.from(input, "base64").toString("ascii");
      const secret = JSON.parse(decrypt(encrypted));

      // if (this.hostIdentifiers[secret.identifier] == secret.roomId)
      if (this.hostIdentifiers[secret.identifier] !== undefined)
        return this.hostIdentifiers[secret.identifier];
      else return null;
    } catch (error) {
      // because of an error parsing json probably
      return null;
    }
  }
}

module.exports = RoomGroup;
