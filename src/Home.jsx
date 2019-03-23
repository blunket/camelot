import React from 'react';

import BlackKnight from './pieces/BlackKnight.png';
import WhiteKnight from './pieces/WhiteKnight.png';
import BlackPawn from './pieces/BlackPawn.png';
import WhitePawn from './pieces/WhitePawn.png';

import shortid from 'shortid'

class HomePage extends React.Component {
    state = {
        playAs: "white",
        gameID: shortid.generate()
    }

    startGame() {
        let gameURL = "/play/" + this.state.gameID + "/" + this.state.playAs
        window.ga('send', 'event', 'game', 'start', this.state.gameID, {
            hitCallback: function () {
                window.location.href = gameURL + '?inviteLink=1'
            }
        })
        setTimeout(() => { // in case google analytics fails
            window.location.href = gameURL + '?inviteLink=1'
        }, 1500)
    }

    render() {
        import('./style/home.scss');

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
                        <div className="custom-control custom-radio custom-control">
                            <input type="radio" id="playAsWhite" name="playAs"
                                className="custom-control-input"
                                onChange={() => { this.setState({ playAs: "white" }) }}
                                checked={this.state.playAs === "white"}
                            />
                            <label className="custom-control-label" htmlFor="playAsWhite">
                                Play as White
                                <img alt="" src={WhitePawn} /><img alt="" src={WhiteKnight} />
                            </label>
                        </div>
                        <div className="custom-control custom-radio custom-control">
                            <input type="radio" id="playAsBlack" name="playAs"
                                className="custom-control-input"
                                onChange={() => { this.setState({ playAs: "black" }) }}
                                checked={this.state.playAs === "black"}
                            />
                            <label className="custom-control-label" htmlFor="playAsBlack">
                                Play as Black
                                <img alt="" src={BlackPawn} /><img alt="" src={BlackKnight} />
                            </label>
                        </div>
                        <button onClick={ () => this.startGame() } className="btn btn-info btn-lg btn-block mt-3">Create Game</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default HomePage
