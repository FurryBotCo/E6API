import phin from "phin";
import util from "util";
import pkg from "./package.json";
import * as fs from "fs";
import qs from "querystring";

class APIError extends Error {
	constructor(err: string, message: string, response?: any) {
		response ? super(`${err}, ${message}, response: ${util.inspect(response, { depth: 1 })}`) : super(`${err}, ${message}`);
		this.name = "APIError";
	}
}

interface E621Post {
	id: number;
	tags: string;
	locked_tags?: string;
	description?: string;
	created_at: {
		json_class: "Time";
		s: number;
		n: number;
	};
	creator_id?: number;
	author?: string;
	change: number;
	source?: string;
	score: number;
	fav_count: number;
	md5?: string;
	file_size?: number;
	file_url?: string;
	file_ext?: string;
	preview_url?: string;
	preview_width?: number;
	preview_height?: number;
	sample_url?: string;
	sample_width?: number;
	sample_height?: number;
	rating: "s" | "q" | "e";
	status: "active" | "deleted";
	width: number;
	height: number;
	has_comments: boolean;
	has_notes: boolean;
	has_childeren?: boolean;
	childeren?: string;
	parent_id?: string;
	artist?: string[];
	sources?: string[];
	delreason?: string;
}

interface E621Tag {
	name: string;
	id: number;
	count: number;
	type: 0 | 1 | 2 | 3 | 4 | 5;
}

class E6API {
	apiKey: string;
	userAgent: string;
	constructor(options?: {
		apiKey?: string;
		userAgent?: string;
	}) {
		if (!options) options = {};
		if (!options.apiKey) options.apiKey = "";
		if (!options.userAgent) options.userAgent = `E6API/${pkg.version} (https://github.com/FurryBotCo/E6API)`;

		this.apiKey = options.apiKey;
		this.userAgent = options.userAgent;
	}

	async login(user: string, pass: string) {
		return phin({
			method: "GET",
			url: `https://e621.net/user/login.json?name=${user}&password=${pass}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());
			return this.apiKey = b.password_hash;
		}).catch(err => {
			throw err;
		});
	}

	// not implemented yet
	/*async createPost(post: {
		tags: string[];
		file: fs.WriteStream;
		upload_url?: string;
		rating: "safe" | "questionable" | "explicit";
		source: string[];
		description?: string;
		is_rating_locked?: boolean;
		is_note_locked?: boolean;
		parent_id?: number;
	} | {
		tags: string[];
		file?: fs.WriteStream;
		upload_url: string;
		rating: "safe" | "questionable" | "explicit";
		source: string[];
		description?: string;
		is_rating_locked?: boolean;
		is_note_locked?: boolean;
		parent_id?: number;
	}): Promise<any> {
	}*/

	// not tested/finished yet
	/*async updatePost(id: number, post: {
		tags?: string[];
		old_tags?: string[];
		rating?: "safe" | "questionable" | "explicit";
		source?: string[];
		description?: string;
		is_rating_locked?: boolean;
		is_note_locked?: boolean;
		parent_id?: number;
	}, reason: string) {
		return phin({
			method: "POST",
			url: "https://e621.net/post/update.json",
			data: {
				id,
				post,
				reason
			},
			parse: "json"
		}).then(res => {
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body);
			else return res.body;
		}).catch(err => {
			throw err;
		});
	}*/

	getPostById(id: number, fetchImage?: false): Promise<E621Post>;
	getPostById(id: number, fetchImage?: true): Promise<{ image: Buffer; post: E621Post }>;

	async getPostById(id: number, fetchImage?: boolean) {
		if (typeof fetchImage !== "boolean") fetchImage = false;
		return phin({
			method: "GET",
			url: `https://e621.net/post/show.json?id=${id}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(async (res) => {
			if (res.statusCode === 404) return null/*throw new APIError(`${res.statusCode} ${res.statusMessage}`, "invalid post id")*/;

			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			if (fetchImage) return {
				image: await phin(b.file_url).then(i => i.body),
				post: b
			};
			else return b;
		}).catch(err => {
			throw err;
		});
	}

	getPostByMD5(md5: string, fetchImage?: false): Promise<E621Post>;
	getPostByMD5(md5: string, fetchImage?: true): Promise<{ image: Buffer; post: E621Post }>;

	async getPostByMD5(md5: string, fetchImage?: boolean) {
		if (typeof fetchImage !== "boolean") fetchImage = false;
		return phin({
			method: "GET",
			url: `https://e621.net/post/check_md5.json?md5=${md5}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(async (res): Promise<any> => {
			if (res.statusCode === 404) return null;

			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			if (!b.exists) return null;

			return fetchImage ? this.getPostById(b.post_id, fetchImage as true) : this.getPostById(b.post_id, fetchImage as false);
		});
	}

	async getPostTagsById(id: number): Promise<{ id: number; tags: E621Tag[] }> {
		return phin({
			method: "GET",
			url: `https://e621.net/post/tags.json?id=${id}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode === 404) return null;
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			return {
				id,
				tags: b
			};
		}).catch(err => {
			throw err;
		});
	}

	async getPostTagsByMD5(md5: string): Promise<{ md5: string; tags: E621Tag[] }> {
		return phin({
			method: "GET",
			url: `https://e621.net/post/tags.json?md5=${md5}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode === 404) return null;
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			return {
				md5,
				tags: b
			};
		}).catch(err => {
			throw err;
		});
	}

	async listPosts(tags?: string[], limit?: number, page?: number, beforeId?: number, filterTags?: string[]): Promise<E621Post[]> {
		const q: {
			tags?: string;
			limit?: number;
			page?: number;
			before_id?: number;
		} = {};

		if (filterTags) filterTags = filterTags.map(t => t.startsWith("-") ? t.slice(1, t.length) : t);
		if (tags && filterTags) if (tags.some(t => filterTags.map(t => t.startsWith("-") ? t.slice(1, t.length).toLowerCase() : t.toLowerCase()).includes(t.toLowerCase()))) throw new TypeError("'tags' conatins a tag that is listed in 'filterTags'");
		if (tags && tags.length > 0) {
			if (tags.length > 6) throw new TypeError("you cannot use more than 6 tags");
			else q.tags = tags.join(" ");

			if (filterTags && tags.some(t => filterTags.map(t => t.startsWith("-") ? t.slice(1, t.length).toLowerCase() : t.toLowerCase()).includes(t.toLowerCase()))) throw new TypeError("'tags' conatins a tag that is listed in 'filterTags'");
		}
		if (limit && limit > 0 && limit < 320) q.limit = limit;
		if (page && page > 0 && page < 750) q.page = page;
		if (beforeId) q.before_id = beforeId;

		return phin({
			method: "GET",
			url: `https://e621.net/post/index.json${Object.keys(q).length > 0 ? `?${qs.encode(q)}` : ""}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode === 404) return null;
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			return filterTags && filterTags.length > 0 ? b.filter(p => !filterTags.some(t => p.tags.split(" ").includes(t))) : b;
		}).catch(err => {
			throw err;
		});
	}

	// flagPost(id: number, flagOption: "inferior", inferiorParent: number): Promise<boolean>;
	// flagPost(id: number, flagOption: "uploader" | "inferior" | 1 | 2 | 3 | 4 | 5 | 6): Promise<boolean>;

	// untested
	/*async flagPost(id: number, flagOption: "uploader" | "inferior" | 1 | 2 | 3 | 4 | 5 | 6, inferiorParent?) {
		return phin({
			method: "GET",
			url: `https://e621.net/post/flag.json?id=${id}&flag_option=${flagOption}${flagOption === "inferior" ? `&inferior_parent=${inferiorParent}` : ""}`,
			headers: {
				"Authorization": this.apiKey,
				"User-Agent": this.userAgent
			},
			parse: "json"
		}).then(res => {
			if (res.statusCode === 404) return false;
			else if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body);

			return true;
		}).catch(err => {
			throw err;
		});
	}*/

	// untested
	/*async deletePost(id: number, reason: string, permanent: boolean): Promise<boolean> {
		return phin({
			method: "GET",
			url: `https://e621.net/post/delete.json?id=${id}&reason=${reason}`,
			headers: {
				"Authorization": this.apiKey,
				"User-Agent": this.userAgent
			},
			parse: "json"
		}).then(async (res) => {
			if (res.statusCode === 404) return null;
			else if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body);

			if (permanent) return phin({
				method: "GET",
				url: `https://e621.net/post/delete.json?id=${id}&reason=${reason}&mode=1`,
				headers: {
					"Authorization": this.apiKey,
					"User-Agent": this.userAgent
				},
				parse: "json"
			}).then(res => {
				if (res.statusCode === 404) return null;
				else if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body);

				return true;
			});

			return true;
		}).catch(err => {
			throw err;
		});
	}*/

	async getDeletedPosts(page?: number, userId?: number): Promise<{ id: number; creator_id: number; author?: string; tags: string; delreason: string; }[]> {
		return phin({
			method: "GET",
			url: `https://e621.net/post/deleted_index.json${page || userId ? `?${page ? `page=${page}${userId ? `&user_id=${userId}` : ""}` : ""}` : ""}`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode === 404) return null;
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());

			return b;
		}).catch(err => {
			throw err;
		});
	}

	async getPopularPosts(type: "day" | "week" | "month"): Promise<E621Post[]> {
		return phin({
			method: "GET",
			url: `https://e621.net/post/popular_by_${type}.json`,
			headers: {
				"User-Agent": this.userAgent
			}
		}).then(res => {
			if (res.statusCode === 404) return null;
			if (res.statusCode !== 200) throw new APIError(`${res.statusCode} ${res.statusMessage}`, res.body.toString());

			const b = JSON.parse(res.body.toString());
			return b;
		}).then(err => {
			throw err;
		});
	}

	/*async revertPostTags(id: number, historyId: number) {

	}*/
}

export = E6API;