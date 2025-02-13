import { beforeEach } from 'node:test';
import { describe, expect, it, vi } from 'vitest';
import { loadDialogWidget, loadFormWidget } from '../../app';

describe('loadFormWidget', () => {
  beforeEach(() => {
    // Reset customElements before each test
    // Ensure we define a mock class for psa-form
    class MockFormElement extends HTMLElement {}
    customElements.define('psa-form', MockFormElement);
  });

  it('should define the psa-form custom element if not already defined', async () => {
    const defineSpy = vi.spyOn(customElements, 'define');

    await loadFormWidget();

    expect(defineSpy).toHaveBeenCalledWith('psa-form', expect.anything());
  });

  it('should not define the psa-form custom element if already defined', async () => {
    const defineSpy = vi.spyOn(customElements, 'define');

    await loadFormWidget();

    expect(defineSpy).not.toHaveBeenCalled();
  });
});

describe('loadDialogWidget', () => {
  beforeEach(() => {
    class MockDialogElement extends HTMLElement {}
    customElements.define('psa-dialog', MockDialogElement);
  });

  it('should define the psa-dialog custom element if not already defined', async () => {
    const defineSpy = vi.spyOn(customElements, 'define');

    await loadDialogWidget();

    expect(defineSpy).toHaveBeenCalledWith('psa-dialog', expect.anything());
  });

  it('should not define the psa-dialog custom element if already defined', async () => {
    const defineSpy = vi.spyOn(customElements, 'define');

    await loadDialogWidget();

    expect(defineSpy).not.toHaveBeenCalled();
  });
});
