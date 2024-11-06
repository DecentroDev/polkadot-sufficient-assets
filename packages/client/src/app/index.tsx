import r2wc from '@r2wc/react-to-web-component';
import { WebPSADialog, WebPSAForm } from './WebComponent';

export { PSADialog, PSAForm } from './ReactComponent';

const WebForm = r2wc(WebPSAForm, {
  props: {
    config: undefined,
    theme: undefined,
  },
});

const WebDialog = r2wc(WebPSADialog, {
  props: {
    config: undefined,
    theme: undefined,
    open: undefined,
    handleClose: undefined,
  },
});

export const loadFormWidget = (tagName = 'psa-form') => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, WebForm);
  }
  return customElements.whenDefined(tagName);
};

export const loadDialogWidget = (tagName = 'psa-dialog') => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, WebDialog);
  }
  return customElements.whenDefined(tagName);
};
