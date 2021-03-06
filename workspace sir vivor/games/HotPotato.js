'use strict';

const name = "Hot Potato";
const description = "__This be a real hot potato.__ **Game rules:** https://survivor-ps.weebly.com/hot-potato.html";
const id = Tools.toId(name);

class HotPotato extends Games.Game {
	constructor(room) {
		super(room);
		this.id = id;
		this.name = name;
		this.description = description;
		this.maxPotatoRounds = 3;
		this.curPotatoRounds = 3;
		this.canPotato = false;
	}

	onStart() {
		this.nextRound();
	}

	onNextRound() {
		this.say("/wall Round " + this.round + "! Remaining Players: " + this.getPlayerNames(this.getRemainingPlayers()));
		this.curPotatoRounds = this.maxPotatoRounds;;
		this.timeout = setTimeout(() => this.beginPotato(), 5 * 1000);
	}

	beginPotato() {
		this.say("!pick " + this.getPlayerNames(this.getRemainingPlayers()));
	}

	handlePick(message) {
		this.curPlayer = this.getPlayer(message);
		this.nextPotato();
	}

	nextPotato() {
		if (this.curPotatoRounds === 0) {
			this.say("**BOOM**! The potato exploded on **" + this.curPlayer.name + "**!");
			this.curPlayer.eliminated = true;
			this.curPlayer = null;
			this.timeout = setTimeout(() => this.nextRound(), 5 * 1000);
			return;
		}
		if (this.getRemainingPlayerCount() === 2) {
			this.canPotato = true;
			this.pass(Object.values(this.getRemainingPlayers()).filter(pl => pl !== this.curPlayer).map(pl => pl.name).join(""), this.curPlayer);
		} else {
			this.canPotato = true;
			this.say("**" + this.curPlayer.name + "**, choose another player to pass the potato to with ``" + Config.commandCharacter + "pass [user]``! (There are **" + this.curPotatoRounds + "** tosses left)");
			this.timeout = setTimeout(() => this.sayPotatoWaiting(), 60 * 1000);
		}
		
	}

	sayPotatoWaiting() {
		this.say("**" + this.curPlayer.name + "**, you're up!");
		this.timeout = setTimeout(() => this.elimPotatoPlayer(), 30 * 1000);
	}

	elimPotatoPlayer() {
		this.say("**" + this.curPlayer.name + "** didn't pass it to anybody, and is eliminated!");
		this.curPlayer.eliminated = true;
		this.curPlayer = null;
		this.timeout = setTimeout(() => this.nextRound(), 5 * 1000);
	}

	handleWinner(winPlayer, losePlayer) {
		if (winPlayer === this.curPlayer) {
			this.say("**" + this.curPlayer.name + "** passes the potato to **" + this.oplayer.name + "**!");
			this.curPlayer = this.oplayer;
		} else {
			this.say("**" + this.curPlayer.name + "** failed to pass the potato!");
		}
		this.curPotatoRounds--;
		this.timeout = setTimeout(() => this.nextPotato(), 5 * 1000);
	}
	pass(target, user) {
		if (!this.curPlayer || this.curPlayer.id !== user.id || !this.canPotato) return;
		let oplayer = this.players[Tools.toId(target)];
		if (!oplayer) return user.say("That player is not in the game!");
		if (oplayer.eliminated) return user.say("That player has already been eliminated!");
		if (oplayer === this.curPlayer) return this.say(">passing to yourself.");
		clearTimeout(this.timeout);
		this.canPotato = false;
		this.oplayer = oplayer;
		this.say("**" + this.curPlayer.name + "** attempts to pass the potato to **" + this.oplayer.name + "**!");
		this.roll1 = 100;
		this.roll2 = 125;
		this.timeout = setTimeout(() => this.sayPlayerRolls(), 5 * 1000);
	}
}

exports.name = name;
exports.id = id;
exports.description = description;
exports.game = HotPotato;
exports.aliases = ["hp"];
exports.commands = {
	"pass": "pass",
}
