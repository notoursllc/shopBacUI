<script>
import { required, email } from 'vuelidate/lib/validators';
import PasswordValidator from '../../../utils/PasswordValidator';
import { getPasswordValidationConfig } from '../../../utils/universal';
import PasswordInputErrors from '@/components/auth/PasswordInputErrors';
import {
    FigButton,
    FigFormInput
} from '@notoursllc/figleaf';

const Validator = new PasswordValidator(getPasswordValidationConfig());
const touchMap = new WeakMap();


export default {
    name: 'RegisterPage',

    components: {
        PasswordInputErrors,
        FigButton,
        FigFormInput
    },

    data() {
        return {
            userData: {
                email: null,
                password: null
            },
            numPasswordErrors: 0
        };
    },

    validations: {
        userData: {
            email: {
                required,
                email
            },
            password: {
                required
            }
        }
    },

    methods: {
        async onSubmit() {
            const response = await this.$api.tenant.member.add(this.userData);
        },

        delayTouch($v) {
            $v.$reset();
            if (touchMap.has($v)) {
                clearTimeout(touchMap.get($v));
            }
            touchMap.set($v, setTimeout($v.$touch, 1000));
        }
    }
};
</script>

<template>
    <div>
        <h1>Register</h1>

        <div>
            <form>
                <!-- email -->
                <div class="inputGroup mr-5 mb-3">
                    <label>{{ $t('Email') }}</label>
                    <fig-form-input
                        v-model="userData.email"
                        @input="delayTouch($v.userData.email)" />

                    <div v-if="$v.userData.email.$invalid" class="text-red-600">
                        <div v-if="!$v.userData.email.required">{{ $t('required') }}</div>
                        <div v-if="$v.userData.email.$dirty && !$v.userData.email.email">{{ $t('invalid email address format') }}</div>
                    </div>
                </div>

                <!-- password -->
                <div class="inputGroup mr-5 mb-3">
                    <label>{{ $t('Password') }}</label>
                    <div>
                        <fig-form-input
                            v-model="userData.password"
                            type="password" />

                        <div class="text-red-600">
                            <password-input-errors
                                :password="userData.password"
                                @numErrors="(num) => { numPasswordErrors = num }" />
                        </div>
                    </div>
                </div>

                <div class="pt-5">
                    <fig-button
                        variant="primary"
                        @click="onSubmit"
                        :disabled="$v.userData.$invalid || numPasswordErrors > 0">{{ $t('Submit') }}</fig-button>
                </div>
            </form>
        </div>
    </div>
</template>
