<template>
  <div
    class="message"
    :class="{message_type_system: system}"
  >
    <time class="message__time">[{{ time | formattedTime }}]</time>
    <span
      class="message__text"
      v-html="raw"
    />
  </div>
</template>

<script lang="ts">
import {
  Component, Vue, Prop,
} from 'vue-property-decorator';
import moment from 'moment';

@Component({
  filters: {
    formattedTime(value: string | number) {
      const curTime = Date.now();
      const time = parseInt(String(value), 10) * 1000;
      const date = new Date(time);
      const curDate = new Date(curTime);

      if (time < curTime) {
        // 86400000 = 1 day in milliseconds
        if (curTime - time < 86400000
            && date.getDate() === curDate.getDate()) {
          return moment(time).format('[Сегодня в] HH:mm:ss');
        }

        // 17280000 = 2 days in milliseconds
        if (curTime - time < 172800000
            && new Date(time + 86400000).getDate() === curDate.getDate()) {
          // 17280000 = 2 days in milliseconds
          return moment(time).format('[Вчера в] HH:mm:ss');
        } if (date.getFullYear() !== curDate.getFullYear()) {
          return moment(time).locale('ru').format('D MMM YYYY в HH:mm:ss');
        }
      }

      return moment(time).format('D MMM в HH:mm:ss');
    },
  },
})
export default class Message extends Vue {
  @Prop({ type: Boolean, required: true }) system!: string;
  @Prop({ type: Number, required: true }) time!: string;
  @Prop({ type: String, required: false, default: '' }) name!: string;
  @Prop({ type: String, required: false, default: '' }) text!: string;
  @Prop({ type: String, required: false, default: '' }) raw!: string;
}
</script>

<style lang="stylus">
  .message
    display block
    word-wrap break-word
    color #2b4b8a
    font-weight 700


    &__time
      color initial
      font-weight initial
      font-style initial


    &__text
      color #000
      font-weight 500


    &_type_system
      font-style italic
      font-weight 500
      color #000

      .fromNick
        color #000
        font-weight 500


  img
    max-height 250px
    max-width 100%

  .msgTime
    display none

  .chatUserFrom
    font-weight 700
    color #2b4b8a

  .fromNick
    text-decoration none
    color #2b4b8a
    font-weight 700

</style>
