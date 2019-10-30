import Vue from 'vue';
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex';
import Cookies from 'js-cookie';
import moment from 'moment';
import StateT from '@/types/StateT';
import api from '@/plugins/api';
import RecordT from '@/types/RecordT';

Vue.use(Vuex);

const state: StateT = {
  records: [],
  tracks: [],
  selectedRecordId: 0,
};

const mutations: MutationTree<StateT> = {
  getCookies(s) {
    const selectedRecordId = Cookies.get('selectedRecordId');
    if (selectedRecordId) {
      s.selectedRecordId = parseInt(selectedRecordId, 10);
    }
  },

  setRecords(s, records) {
    s.records = records;
  },

  selectRecord(s, id) {
    s.selectedRecordId = id;
    Cookies.set('selectedRecordId', id, { expires: 3650 });
  },

  setTracks(s, tracks) {
    s.tracks = tracks;
  },
};

const getters: GetterTree<StateT, StateT> = {
  selectedRecord(s): RecordT {
    return s.records.find(({ id }) => (s.selectedRecordId === id))
      || {
        id: 0, name: 'Выберите запись...', src: '', date: '1970-01-01T00:00:00.000Z',
      };
  },
  records(s): RecordT[] {
    return s.records
      .map((r) => {
        const date: string = moment(r.date).utcOffset('+03:00').format('DD.MM.YYYY');
        r.name = `${date} ${r.name}`;
        return r;
      })
      .sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()));
  },
};

const actions: ActionTree<StateT, StateT> = {
  async getRecords({ commit }) {
    const response = await api.getRecords();
    if (response) {
      commit('setRecords', response.data);
    }
  },

  async getTracks({ commit }, before: number) {
    const response = await api.getTracks({ before });
    if (response) {
      commit('setTracks', response.data.history);
    }
  },
};

export default new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
});
