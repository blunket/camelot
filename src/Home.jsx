import React from 'react';

import CastleIcon from './img/castle.png';
import { Link } from "react-router-dom"

import shortid from 'shortid'

class HomePage extends React.Component {
    state = {
        playAs: "white",
        gameID: shortid.generate()
    }

    render() {
        import('./style/home.scss');

        let gameURL = "/play/" + this.state.gameID + "/" + this.state.playAs

        return (
            <div className="container my-4">
                <div className="jumbotron text-center border">
                    <h1>PlayCamelot.com</h1>
                    <hr />
                    <p className="mb-0">
                        Play the Camelot board game online, free!
                    </p>
                </div>

                <div className="card mt-4">
                    <div className="card-body">
                        <h2>Welcome to PlayCamelot.com</h2>
                        <hr/>
                        <p>PlayCamelot.com is the best way to play the board game Camelot with your friends, second only to real-life play!</p>
                    </div>
                </div>

                <div className="card mt-4">
                    <div className="card-body">
                        <h2>Create Game</h2>
                        <hr/>
                        <p>Choose your settings below, then click the Create Game button to start a game with a friend! You will be given a link to share. If your friend has already created a game, please ask them for the link to join.</p>
                        <h4>Game Options</h4>
                        <div className="custom-control custom-radio custom-control-inline">
                          <input type="radio" id="playAsWhite" name="playAs"
                                className="custom-control-input"
                                onChange={() => { this.setState({ playAs: "white" }) }}
                                checked={this.state.playAs === "white"}
                          />
                          <label className="custom-control-label" for="playAsWhite">Play As White</label>
                        </div>
                        <div className="custom-control custom-radio custom-control-inline">
                          <input type="radio" id="playAsBlack" name="playAs"
                                className="custom-control-input"
                                onChange={() => { this.setState({ playAs: "black" }) }}
                                checked={this.state.playAs === "black"}
                          />
                          <label className="custom-control-label" for="playAsBlack">Play As Black</label>
                        </div>
                        <a href={gameURL} className="btn btn-info btn-lg">Create Game</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default HomePage
