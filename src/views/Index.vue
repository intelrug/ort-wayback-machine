<template>
  <div class="page__wrapper">
    <div class="page__header" />
    <div class="page__content">
      <div class="content">
        <div class="content__player">
          <audio
            ref="audio"
            class="content__audio"
            :src="`https://projects.everypony.ru/ort/archive/${selectedRecord.src}`"
            controls
          />
        </div>
        <div class="content__controls">
          <div class="content__controls-select2">
            <select2
              v-model="selectedRecordId"
              :options="records"
            />
          </div>
          <div class="content__controls-time">
            <input
              v-model="startAtDate"
              type="date"
            >
            <input
              v-model="startAtTime"
              type="time"
              step="1"
            >
          </div>
          <button
            class="content__offset-button"
            @click="timeOffset(-10)"
          >
            -10
          </button>
          <button
            class="content__offset-button"
            @click="timeOffset(10)"
          >
            +10
          </button>
        </div>
        <div
          v-if="noHistory"
          ref="messages-container"
          class="content__messages"
        >
          <message
            :system="true"
            :time="startAt"
            raw=" <b>История чата за текущий период отсутствует</b>"
          />
        </div>
        <div
          v-else
          ref="messages-container"
          class="content__messages"
        >
          <message
            v-for="m in messagesVisible"
            :key="m.id"
            :system="m.userId === 0"
            :time="m.time"
            :name="m.username"
            :text="m.text"
            :raw="m.raw"
          />
        </div>
      </div>
    </div>
    <div class="page__footer" />
  </div>
</template>

<script lang="ts">
import {
  Component, Ref, Vue, Watch,
} from 'vue-property-decorator';
import {
  Action, Getter, Mutation, State,
} from 'vuex-class';
import moment, { Moment } from 'moment';
import Message from '@/components/Message.vue';
import MessageT from '@/types/MessageT';
import api from '@/plugins/api';
import StateT from '@/types/StateT';
import RecordT from '@/types/RecordT';
import Select2 from '@/components/Select2.vue';

@Component({
  components: {
    Message,
    Select2,
  },
  filters: {
    seconds(time: number) {
      const seconds = `0${time % 60}`.slice(-2);
      const minutes = Math.abs(Math.trunc(time / 60));
      return `${time < 0 ? '-' : ''}${minutes}:${seconds}`;
    },
  },
})
export default class Index extends Vue {
  @Ref() audio!: HTMLAudioElement;
  @Ref('messages-container') messagesContainer!: HTMLElement;

  @State((s: StateT) => s.records) records!: RecordT[];
  @State((s: StateT) => s.selectedRecordId) selectedRecordIdState!: number;
  @Getter('selectedRecord') selectedRecord!: RecordT;
  @Mutation('getCookies') getCookiesMutation!: Function;
  @Mutation('selectRecord') selectRecordMutation!: Function;
  @Action('getRecords') getRecordsAction!: Function;

  private messages: MessageT[] = [];
  private startAtDate: string = '1970-01-01';
  private startAtTime: string = '03:00';
  private audioCurrentTime: number = 0;
  private noHistory: boolean = false;

  @Watch('audioCurrentTime')
  async onAudioCurrentTimeChanged() {
    if (this.messages.length === 0) return;

    const timeBorderBottom: number = this.messages[0].time;
    const timeBorderTop: number = this.messages[this.messages.length - 1].time;
    if (this.time > timeBorderBottom || this.time < timeBorderTop) {
      if (this.time > timeBorderBottom && this.time - timeBorderBottom < 5) {
        await this.getHistory(false, this.time - 1);
      } else {
        this.messages = [];
        await this.getHistory(true, this.time + 1);
        await this.getHistory(false, this.time - 1);
        this.messages.sort((a, b) => (a.time <= b.time ? 1 : -1));
      }
    }
  }

  @Watch('selectedRecordId')
  async onRecordChanged() {
    this.startAtDate = moment(this.selectedRecord.date).utcOffset('+03:00').format('YYYY-MM-DD');
    this.startAtTime = moment(this.selectedRecord.date).utcOffset('+03:00').format('HH:mm:ss');
    this.noHistory = false;
    this.messages = [];
    if (this.selectedRecord.id === 0) {
      this.noHistory = true;
      return;
    }
    await this.getHistory(true, this.time);
    if (this.messages.length !== 0) {
      await this.getHistory(false, this.time);
      return;
    }
    this.noHistory = true;
  }

  get selectedRecordId() {
    return this.selectedRecordIdState;
  }

  set selectedRecordId(value: number) {
    this.selectRecordMutation(value);
  }

  get messagesVisible(): MessageT[] {
    return this.messages.filter(m => m.time <= this.time);
  }

  get startAt() {
    return new Date(`${this.startAtDate}T${this.startAtTime}`).getTime() / 1000;
  }

  get time() {
    return this.startAt + Math.trunc(this.audioCurrentTime);
  }

  async created() {
    this.getCookiesMutation();
    await this.getRecords();
    this.onRecordChanged();
    await this.$nextTick();
    this.watchAudioTime();
  }

  watchAudioTime() {
    setInterval(() => {
      this.audioCurrentTime = this.audio.currentTime;
    }, 1000);
  }

  async getRecords() {
    await this.getRecordsAction();
    if (this.selectedRecord.id === 0 && this.records.length > 0) {
      this.selectRecordMutation(this.records[0].id);
    }
    this.onRecordChanged();
  }

  timeOffset(offset: number) {
    let m: Moment;
    if (offset > 0) {
      m = moment(this.startAtTime, 'HH:mm:ss').add(offset, 'seconds');
    } else {
      m = moment(this.startAtTime, 'HH:mm:ss').subtract(Math.abs(offset), 'seconds');
    }
    this.startAtTime = m.format('HH:mm:ss');
  }

  async getHistory(reverse: boolean, time: number) {
    const response = await api.getMessages({ reverse, time });
    if (response) {
      response.data.forEach((message: MessageT) => {
        if (!this.messages.find(m => m.id === message.id)) {
          if (reverse) {
            this.messages.push(message);
          } else {
            this.messages.unshift(message);
          }
        }
      });
    }
  }
}
</script>

<style lang="stylus" src="./Index.styl" />
