import React, {useEffect, useState} from 'react';
import './App.css';
import {Amplify, Auth, Hub} from "aws-amplify";
import awsExports from './aws-exports';
import {AmplifyAuthenticator, AmplifySignIn, AmplifySignUp} from "@aws-amplify/ui-react";
import GlobalStyles from "./components/GlobalStyles";
import Main from "./components/Main";
import { ThemeProvider } from '@material-ui/core';
import theme from './theme';
import {HubCapsule} from "@aws-amplify/core/src/Hub";

Amplify.configure(awsExports)
Amplify.Logger.LOG_LEVEL = 'DEBUG';

function App() {

    const [logged, setLogged] = useState(false);

    useEffect(() => {

        Auth.currentSession().then((session) => {
            setLogged(session.isValid());
        });

        const listener = (data: HubCapsule) => {
            switch (data.payload.event) {
                case 'signIn':
                    setLogged(true);
                    break;
                case 'signOut':
                    setLogged(false);
                    break;
                case 'tokenRefresh':
                    break;
            }
        }

        Hub.listen('auth', listener);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <AmplifyAuthenticator>
                  <GlobalStyles />
                  {logged?<Main/>:null}
                  <AmplifySignUp
                      slot="sign-up"
                      usernameAlias="email"
                          formFields={[
                              {
                                  type: "email",
                                  label: "E-mail",
                                  placeholder: "E-mail",
                                  inputProps: { required: true, autocomplete: "email" },
                              },
                              {
                                  type: "password",
                                  label: "Password",
                                  placeholder: "Password",
                                  inputProps: { required: true, autocomplete: "new-password" },
                              },
                              {
                                  type: "name",
                                  label: "Name",
                                  placeholder: "Full name",
                              }
                          ]}/>
                  <AmplifySignIn slot="sign-in" usernameAlias="email" />
            </AmplifyAuthenticator>
        </ThemeProvider>
    );
}

export default App;
