<script>
import Vue from 'vue';
import { colorLuminance } from '@/utils/common';

import {
    FigTooltip
} from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'ColorSwatch',

    components: {
        FigTooltip
    },

    props: {
        hex: {
            type: String,
            required: true
        },

        label: {
            type: String,
            default: ''
        },

        size: {
            type: String,
            default: 'md',
            validator: (value) => {
                return ['sm', 'md', 'lg'].includes(value);
            }
        },

        tooltip: {
            type: Boolean,
            default: false
        }
    },

    data: function() {
        return {

        };
    },

    computed: {
        classNames() {
            const classes = ['rounded-full'];

            classes.push(
                `swatch-${this.size}`
            );

            return classes;
        }
    },

    render(h) {
        const swatch = h(
            'div',
            {
                class: this.classNames,
                style: `background:${this.hex}`
            },
            []
        );


        if(this.tooltip) {
            return h(
                'FigTooltip',
                {
                    props: {
                        placement: 'top'
                    }
                },
                [
                    h(
                        'div',
                        {
                            slot: 'toggler'
                        },
                        [ swatch ]
                    ),
                    this.label
                ]
            );
        }
        else {
            return swatch;
        }

    }
});
</script>


<style scoped>
.swatch-sm {
    width: 20px;
    height: 20px;
}
.swatch-md {
    width: 30px;
    height: 30px;
}
.swatch-lg {
    width: 40px;
    height: 40px;
}
</style>
