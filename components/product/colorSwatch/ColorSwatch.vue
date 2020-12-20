<script>
import Vue from 'vue';

import {
    FigTooltip
} from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'ColorSwatch',

    components: {
        FigTooltip
    },

    props: {
        swatches: {
            type: Array,
            default: () => {
                return [];
            }
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

    computed: {
        classNames() {
            const classes = [
                'rounded-full',
                'inline-block'
            ];

            classes.push(
                `swatch-${this.size}`
            );

            return classes;
        },

        bgStyle() {
            const style = [];

            const numSwatches = this.swatches.length;

            if(numSwatches) {
                style.push(
                    'background: linear-gradient(90deg'
                );

                const basePercentage = Math.floor(100 / numSwatches);

                this.swatches.forEach((obj, index) => {
                    const endPercent = basePercentage * (index + 1);

                    style.push(
                        `${obj.swatch} ${basePercentage * index}%`,
                        `${obj.swatch} ${endPercent === 99 ? 100 : endPercent}%`
                    );
                });
            }

            return style.join(',');
        }
    },

    render(h) {
        const swatch = h(
            'div',
            {
                class: this.classNames,
                style: this.bgStyle
            },
            []
        );


        if(this.tooltip) {
            const ttContent = [];

            this.swatches.forEach((obj) => {
                ttContent.push(
                    h(
                        'div',
                        {},
                        obj.label
                    )
                );
            });

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
                    ttContent
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
