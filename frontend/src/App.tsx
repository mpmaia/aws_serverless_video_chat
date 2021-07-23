import React, {useCallback, useEffect, useState} from 'react';
import './App.css';
import {Amplify, Auth} from "aws-amplify";
import awsExports from './aws-exports';
import {AmplifyAuthenticator, AmplifySignIn, AmplifySignOut, AmplifySignUp} from "@aws-amplify/ui-react";
import axios from "axios";
import {BASE_URL} from "./env";

Amplify.configure(awsExports)

function App() {

    const [hello, setHello] = useState("");

    const callHello = useCallback(() => {
        Auth.currentSession().then(session => {
            if(session.isValid()) {
                const config = {
                    headers: {
                        Authorization: `Bearer ${session.getIdToken().getJwtToken()}`,
                    },
                };
                axios.get(BASE_URL + "/hello", config).then(resp => {
                    setHello(JSON.stringify(resp.data, null, 2));
                });
            }
        });
    }, []);



    return (
          <AmplifyAuthenticator>
              <header>
                  Amplify Login Example
                  <AmplifySignOut />
              </header>
              <pre>
                  {hello}
              </pre>
              <button onClick={callHello}>Call Hello</button>
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
