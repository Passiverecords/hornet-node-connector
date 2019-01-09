var redis = require("redis")

class Hornet {
	constructor(options) {
		this.redis_options = options
		this.clientPublish = redis.createClient(options)
		this.clientSubscribe = redis.createClient(options)
	}

	redis_options(redis_options) {
		this.redis_options = redis_options
	}

	async create_access_token(channels) {
		this.token = (await require("crypto").randomBytes(24)).toString("hex")

		let key = "hornet:token:" + this.token

		if (Array.isArray(channels)) {
			channels.forEach(channel => {
				this.clientPublish.sadd(key, channel)
				this.clientPublish.expire(key, this.token_TTL())
				this.clientSubscribe.subscribe(`hornet:channel:${channel}`)
			})
		} else {
			this.clientPublish.sadd(key, channels)
			this.clientPublish.expire(key, this.token_TTL())
			this.clientSubscribe.subscribe(`hornet:channel:${channels}`)
		}

		return this.token
	}

	disconnect_tokens(tokens) {
		disconnectMsg = "tokens:" + tokens.to_json
		this.publish("hornet", "disconnect_tokens", disconnectMsg)
	}

	publish(channels, type, msg, options) {
		if (Array.isArray(channels)) {
			channels.forEach(channel => {
				this.clientPublish.publish(
					`hornet:channel:${channel}`,
					JSON.stringify({
						...options,
						message: msg,
						type: type,
						channels: [channel]
					})
				)
			})
		} else {
			this.clientPublish.publish(
				`hornet:channel:${channels}`,
				JSON.stringify({
					...options,
					message: msg,
					type: type,
					channels: [channels]
				})
			)
		}
		return true
	}

	subscribe(callback) {
		this.clientSubscribe.on("message", function(channel, message) {
			callback(channel, message)
		})
	}

	token_TTL(token_TTL) {
		if (token_TTL) this.token_TTL = token_TTL
		return token_TTL || 3600
	}

	redis() {
		return redis.createClient(redis_options)
	}
}

module.exports = Hornet
