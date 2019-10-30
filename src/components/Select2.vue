<template>
  <div class="select2">
    <input
      ref="input"
      v-model="searchText"
      :placeholder="selectedOption.name"
      autocomplete="off"
      class="select2__input"
      type="text"
      @keydown.38="arrowUp"
      @keydown.40="arrowDown"
      @keydown.13="selectOption(hoveredOption.id)"
    >
    <div
      ref="options"
      class="select2__options"
    >
      <div
        v-for="o in optionsFiltered"
        :key="o.id"
        class="select2__option"
        :class="{select2__option_selected: o.id === hoveredOption.id}"
        @click="selectOption(o.id)"
      >
        {{ o.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component, PropSync, Ref, Vue,
} from 'vue-property-decorator';

@Component({})
export default class Select2 extends Vue {
  @PropSync('options', { required: true, default: [] }) propOptions!: {id: number; name: string}[];
  @PropSync('value') propValue!: number;
  @Ref('options') refOptions!: HTMLElement;
  @Ref('input') refInput!: HTMLInputElement;

  private searchText: string = '';
  private hoveredId: number = 0;
  private defaultOption: {id: number, name: string} = { id: 0, name: '' };

  created() {
    this.hoveredId = this.propOptions.length !== 0 ? this.propOptions[0].id : this.defaultOption.id;
  }

  get optionsFiltered() {
    return this.propOptions.filter(
      o => o.name.toLowerCase().indexOf(this.searchText.toLowerCase()) !== -1,
    );
  }

  get hoveredOption() {
    return this.propOptions.find(o => o.id === this.hoveredId) || this.defaultOption;
  }

  get selectedOption() {
    return this.propOptions.find(o => o.id === this.propValue) || this.defaultOption;
  }

  selectOption(id: number) {
    this.$emit('input', id);
    this.refInput.blur();
    this.searchText = '';
    this.hoveredId = this.propOptions[0].id;
    this.refOptions.children[0].scrollIntoView({ block: 'start' });
    this.refOptions.style.display = 'none';
    setTimeout(() => {
      this.refOptions.style.display = '';
    }, 500);
  }

  arrowUp() {
    const id = this.optionsFiltered.findIndex(o => o.id === this.hoveredId);
    if (id === -1) {
      this.hoveredId = this.optionsFiltered[0].id;
      return;
    }

    if (id !== 0) {
      this.hoveredId = this.optionsFiltered[id - 1].id;
      this.refOptions.children[id - 1].scrollIntoView({ block: 'nearest' });
    }
  }

  arrowDown() {
    const id = this.optionsFiltered.findIndex(o => o.id === this.hoveredId);
    if (id === -1) {
      this.hoveredId = this.optionsFiltered[0].id;
      return;
    }
    if (id !== this.optionsFiltered.length - 1) {
      this.hoveredId = this.optionsFiltered[id + 1].id;
      this.refOptions.children[id + 1].scrollIntoView({ block: 'nearest' });
    }
  }
}
</script>

<style lang="stylus">
  .select2
    display block


    &__input
      width 100%
      height 36px
      padding 4px 8px
      border 1px solid #ddd
      border-radius 3px
      // box-shadow: inset 0 0 4px #eaeaea

      &::placeholder
        color #000

      &:focus
        border-bottom none
        border-radius 3px 3px 0 0

      &:focus + div
        display block


    &__options
      position absolute
      top 100%
      z-index 1
      display none
      overflow-y auto
      width 100%
      max-height 250px
      background #fcfcfc
      border 1px solid #eaeaea
      border-top 1px solid #f0f0f0
      border-radius 0 0 3px 3px
      box-shadow 0 6px 6px rgba(0, 0, 0, .16)

      &:hover
        display block


    &__option
      padding 6px 8px
      cursor pointer
      font-size 15px

      &:hover, &_selected
        background #f0f0f0
</style>
