import { nextTick, watch, type Ref } from 'vue'

/**
 * Keeps the child at `index` of a scrollable list visible: whenever the index
 * changes, that child is scrolled into view (after Vue has updated the DOM).
 */
export function useScrollToChild(container: Ref<HTMLElement | null>, index: Ref<number>) {
  watch(index, async (value) => {
    await nextTick()
    container.value?.children[value]?.scrollIntoView({ block: 'nearest' })
  })
}
