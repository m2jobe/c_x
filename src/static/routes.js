import React from 'react';
import { Route, Switch } from 'react-router';
import { CryptopiaView, HomeView, LoginView, ProtectedView, NotFoundView } from './containers';
import requireAuthentication from './utils/requireAuthentication';

export default(
    <Switch>
        <Route exact path="/" component={HomeView} />
        <Route path="/cryptopia" component={LoginView} />
        <Route path="/calculator" component={ProtectedView} />
        <Route path="*" component={NotFoundView} />
    </Switch>

);
