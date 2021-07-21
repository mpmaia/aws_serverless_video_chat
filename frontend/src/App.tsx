import React from 'react';
import './App.css';
import {Amplify} from "aws-amplify";
import awsExports from './aws-exports';
import {AmplifyAuthenticator, AmplifySignIn, AmplifySignOut, AmplifySignUp} from "@aws-amplify/ui-react";

Amplify.configure(awsExports)

function App() {
  return (
      <AmplifyAuthenticator>
          <header>
              Amplify Login Example
              <AmplifySignOut />
          </header>
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
              ]}
          />
          <AmplifySignIn slot="sign-in" usernameAlias="email" />
      </AmplifyAuthenticator>
  );
}

export default App;
