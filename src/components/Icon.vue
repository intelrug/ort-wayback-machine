<template>
  <svg
    :class="className"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title v-if="title">{{ title }}</title>
    <use
      :xlink:href="iconPath"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    />
  </svg>
</template>

<script lang="ts">
import {
  Component, Prop, PropSync, Vue,
} from 'vue-property-decorator';

@Component({})
export default class Icon extends Vue {
  @Prop({ type: String, required: true }) name!: string;

  @Prop({ type: String, default: null }) title!: string;

  @PropSync('class', { type: String, default: null }) className!: string;

  get iconPath() {
    let icon = require(`@/assets/icons/${this.name}.svg`);
    if (Object.prototype.hasOwnProperty.call(icon, 'default')) {
      icon = icon.default;
    }

    return icon.url;
  }
}
</script>

<style>

</style>
