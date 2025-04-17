"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModel = void 0;
class AIModel {
    constructor(model, config) {
        this.model = model;
        this.config = config;
        this.messages = [
            {
                role: 'system',
                content: this.config.systemPrompt,
            },
        ];
    }
    addMessage(message) {
        this.messages.push(message);
    }
    getMessages() {
        return this.messages;
    }
    applyCorrection(correction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addMessage({ role: 'system', content: correction });
            yield this.sendRequest();
        });
    }
    generate(prompt, options = {}, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addMessage({ role: 'user', content: prompt });
            return yield this.sendRequest(options).then((reply) => {
                // const reply = res; // Adjust based on actual API response format
                if (!reply)
                    return "Idk it returned 500 (reply doesn't exist)";
                callback(reply.response);
                return reply.response;
            });
        });
    }
    getModel() {
        return this.model;
    }
    sendRequest(extraData = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `http://${this.config.server}:${this.config.port}${this.config.route}`;
            console.log("[URL]", url);
            const payload = Object.assign({ messages: this.messages }, extraData);
            try {
                const response = yield fetch(url, {
                    method: this.config.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error('Error sending request to model:', error);
                return null;
            }
        });
    }
}
exports.AIModel = AIModel;
