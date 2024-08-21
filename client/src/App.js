import React from 'react';
import Form from './components/Form';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
  
}
const App = () => {
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
       <SignedIn>
    <div className="App">
       <Form />
    </div>
    </SignedIn>
    <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
};

export default App;



