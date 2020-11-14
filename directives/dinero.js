import accounting from 'accounting';
import fx from 'money';

/*
* NOTE: I build this to be a directive for input type="number"
* Its purpose is to format the input value for currency.
* I've decided to use 'vue-currency-input' lib instead but keeping this
* around in case I decide to come back to it
*/

export default {
    bind (el, { value: optionsFromBinding }, vnode) {
        const inputElement = el.tagName.toLowerCase() === 'input' ? el : el.querySelector('input');
        if (!inputElement) {
            throw new Error('No input element found');
        }
    },

    componentUpdated: function (el) {
        // console.log("dinero",el.value, typeof el.value);
        let newVal = accounting.toFixed(parseFloat(el.value), 2);
        newVal = fx.convert(newVal);

        el.value = newVal;

        // this is needed for components that wrap native HTML input elements
        // so the change gets emitted to those wrappers
        el.dispatchEvent(new Event('input'));
        el.dispatchEvent(new Event('change'));
    }
};
