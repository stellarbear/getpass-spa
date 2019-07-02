import React from 'react';
import MetaTags from 'react-meta-tags';
import { CardContent, CardActions, Grid, Button } from '@material-ui/core';

import SwitchField from 'components/SwitchField';
import PasswordField from 'components/PasswordField';
import { copyToClipboard, randomImplementation } from 'auxiliary';
import NumericInputField from 'components/NumericInputField';
import InputField from 'components/InputField';
import { alphabet } from 'auxiliary/alphabet';
import { NotificationContext } from 'components/NotifyWrapper';
import { defaults } from "auxiliary";
import CardWrapper from 'components/CardWrapper';
import Loading from './Loading';

class Random extends React.Component {
    state = {
        valid: true,
        buttonText: 'GeneratePassword',
        password: '',
        length: 18,
        lower: true,
        upper: true,
        number: true,
        special: true,
        customAlphabetFlag: false,
        customAlphabetValue: alphabet({
            lower: true,
            upper: true,
            number: true,
            special: true,
        }),
        isGenerating: false,
    }

    onChange = (propName: string, value: any) => {
        let state = { ...this.state, [propName]: value };

        let customAlphabetValue = '';
        if (!state.customAlphabetFlag) {
            customAlphabetValue = alphabet({
                lower: state.lower,
                upper: state.upper,
                number: state.number,
                special: state.special,
            })
        }
        else {
            customAlphabetValue = Array.from(new Set(state.customAlphabetValue.split(''))).join('');
        }
        if (customAlphabetValue.length > 0) {
            state.buttonText = 'Get Pass!';
            state.valid = true;
        } else {
            state.buttonText = 'Alphabet cannot be empty!';
            state.valid = false;
        }

        this.setState({ ...state });
        this.setState({ customAlphabetValue });
    }
    generatePassword = async (notify: (message: string) => void) => {
        this.setState({ isGenerating: true });
        setTimeout(async () => {
            try {
                const pass = await randomImplementation(this.state);

                notify('Password is generated and copied to clipboard');
                this.setState({ password: pass, isGenerating: false });

                setTimeout(() => {
                    copyToClipboard(pass);
                }, 256);
            }
            catch{
                notify('Incompatible core params!');
                this.setState({ isGenerating: false });
            }
        }, 16);
    }

    renderOptions = () => {
        const { state, onChange } = this;
        const { length,
            lower,
            upper,
            number,
            special, } = state;
        return (
            <>
                <SwitchField label='Numbers (0-9)' value={number} onChange={(value: boolean) => onChange('number', value)} />
                <SwitchField label='Lower case (a-z)' value={lower} onChange={(value: boolean) => onChange('lower', value)} />
                <SwitchField label='Upper case (A-Z)' value={upper} onChange={(value: boolean) => onChange('upper', value)} />
                <SwitchField label='Special (!#$%&()*+,-.:;<=>?@[]^_{})' value={special} onChange={(value: boolean) => onChange('special', value)} />
                <NumericInputField label='Password length' min={1} max={4096} value={length} onChange={(value: number) => onChange('length', value)} />
            </>
        );
    }

    renderCustomAlphabet = () => {
        const { state, onChange } = this;
        const {
            customAlphabetFlag,
            customAlphabetValue,
        } = state;

        return (
            <>
                <SwitchField label='Custom alphabet' value={customAlphabetFlag} onChange={(value: boolean) => onChange('customAlphabetFlag', value)} />
                {customAlphabetFlag && <InputField label='alphabet' adornment={false} disabled={!customAlphabetFlag} value={customAlphabetValue} onChange={(value: string) => onChange('customAlphabetValue', value)} />}
            </>
        );
    }

    renderGenerateButton = () => {
        const { state, generatePassword } = this;
        const {
            valid,
            buttonText,
        } = state;

        return (
            <NotificationContext.Consumer>
                {({ updateMessage }) =>
                    <Button variant="contained" color="primary" disabled={!valid} onClick={() => generatePassword(updateMessage)}>
                        {buttonText}
                    </Button>
                }
            </NotificationContext.Consumer>);
    }

    render() {
        const { state, renderGenerateButton, renderCustomAlphabet, renderOptions } = this;
        const { password, isGenerating } = state;
        return (
            <React.Fragment>
                <MetaTags>
                    <title>Getpass | Strong Password Generator</title>
                    <meta name="description" content="Generate strong passwords on-demand. We don't store you data. Check our github repository for details." />
                </MetaTags>
                <Loading open={isGenerating} />
                <CardWrapper>
                    <CardContent>
                        <Grid container spacing={24}>
                            <Grid item xs={12} style={{ width: 600 }}>
                                <Grid container direction="column" >
                                    {renderOptions()}
                                    {renderCustomAlphabet()}
                                    {renderGenerateButton()}
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions style={{ backgroundColor: defaults.primaryColor }}>
                        <PasswordField label="Password" value={password} />
                    </CardActions>
                </CardWrapper>
            </React.Fragment>
        );
    }
};

export default Random;