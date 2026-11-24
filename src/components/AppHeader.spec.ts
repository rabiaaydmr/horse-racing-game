import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '@/components/AppHeader.vue'

const toggleButton = '[data-testid="toggle-button"]'
const generateButton = '[data-testid="generate-button"]'

describe('AppHeader', () => {
  it('disables Start until a program exists', () => {
    const wrapper = mount(AppHeader, { props: { status: 'idle', canStart: false } })

    expect(wrapper.get(toggleButton).attributes('disabled')).toBeDefined()
  })

  it.each([
    ['ready', 'Start'],
    ['running', 'Pause'],
    ['paused', 'Resume'],
  ] as const)('labels the button for status "%s" as %s', (status, label) => {
    const wrapper = mount(AppHeader, { props: { status, canStart: true } })

    expect(wrapper.get(toggleButton).text()).toBe(label)
  })

  it('tells its parent about clicks instead of acting itself', async () => {
    const wrapper = mount(AppHeader, { props: { status: 'ready', canStart: true } })

    await wrapper.get(generateButton).trigger('click')
    await wrapper.get(toggleButton).trigger('click')

    expect(wrapper.emitted('generate')).toHaveLength(1)
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
