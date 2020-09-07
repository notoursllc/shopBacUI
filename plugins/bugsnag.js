import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue';

export default (context, inject) => {

    Bugsnag.start({
        apiKey: context.$config.BUG_SNAG_API_KEY,
        plugins: [new BugsnagPluginVue()],
        notifyReleaseStages: [ 'production' ]
    });

    inject('bugsnag', Bugsnag);

};

