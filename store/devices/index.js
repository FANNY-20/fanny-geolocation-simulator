import { v4 as uuidv4 } from "uuid";
import randomColor from "randomcolor";

const CREATE_DEVICE = "CREATE_DEVICE";
const UPDATE_DEVICE_COORDS = "UPDATE_DEVICE_COORDS";
const REMOVE_ALL_DEVICES = "REMOVE_ALL_DEVICES";
const DECLARE_GEOLOCATION_REQUEST = "DECLARE_GEOLOCATION_REQUEST";
const DECLARE_GEOLOCATION_SUCCESS = "DECLARE_GEOLOCATION_SUCCESS";
const DECLARE_GEOLOCATION_FAIL = "DECLARE_GEOLOCATION_FAIL";

export const state = () => ({
  list: [],
});

export const getters = {};

export const mutations = {
  [CREATE_DEVICE](state, { device }) {
    state.list.push(device);
  },
  [UPDATE_DEVICE_COORDS](state, { uuid, coords }) {
    const foundDevice = state.list.find(o => o.uuid === uuid);

    if (foundDevice) {
      foundDevice.coords = coords;
    }
  },
  [REMOVE_ALL_DEVICES](state) {
    state.list = [];
  },
  [DECLARE_GEOLOCATION_REQUEST]() {
    // Noop
  },
  [DECLARE_GEOLOCATION_SUCCESS](state, { uuid }) {
    const foundDevice = state.list.find(o => o.uuid === uuid);

    if (foundDevice) {
      foundDevice.lastDeclaredAt = this.$moment();
    }
  },
  [DECLARE_GEOLOCATION_FAIL]() {
    // Noop
  },
};

export const actions = {
  spawnDevice({ commit, dispatch }, { coords }) {
    const uuid = uuidv4();

    const device = {
      uuid,
      color: randomColor({
        luminosity: "dark",
      }),
      coords,
      lastDeclaredAt: null,
    };

    commit(CREATE_DEVICE, { device });
    dispatch("declareGeolocation", { uuid, coords });
  },
  updateDeviceCoords({ commit, dispatch }, { uuid, coords }) {
    commit(UPDATE_DEVICE_COORDS, { uuid, coords });
    dispatch("declareGeolocation", { uuid, coords });
  },
  removeAllDevices({ commit }) {
    commit(REMOVE_ALL_DEVICES);
  },
  async declareGeolocation({ commit }, { uuid, coords }) {
    commit(DECLARE_GEOLOCATION_REQUEST);

    const body = {
      uuid,
      lat: coords.lat,
      lon: coords.lng,
    };

    try {
      const { data } = await this.$axios.$post("geolocations", body);

      commit(DECLARE_GEOLOCATION_SUCCESS, { uuid });

      return data;
    } catch(e) {
      commit(DECLARE_GEOLOCATION_FAIL);

      throw e;
    }
  },
};
