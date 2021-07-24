import React from 'react';
import './App.css';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {AmplifyAuthenticator, AmplifySignIn, AmplifySignUp} from "@aws-amplify/ui-react";
import GlobalStyles from "./components/GlobalStyles";
import MainLayout from "./components/Layout";
import { ThemeProvider } from '@material-ui/core';
import theme from './theme';

Amplify.configure(awsExports)

function App() {

    return (
        <ThemeProvider theme={theme}>
            <AmplifyAuthenticator>
                  <GlobalStyles />
                  <MainLayout/>
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
