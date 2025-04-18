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
exports.OllamaModel = void 0;
class OllamaModel {
    constructor(model, config) {
        this.model = model;
        this.config = config;
        this.messages = [
            {
                role: 'system',
                message: this.config.systemPrompt,
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
            this.addMessage({ role: 'system', message: correction });
            yield this.sendRequest();
        });
    }
    generate(prompt, options = {}, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addMessage({ role: 'user', message: prompt });
            const data = yield this.sendRequest(options);
            const reply = (data === null || data === void 0 ? void 0 : data.response) || ''; // Adjust based on actual API response format
            callback(reply);
        });
    }
    getModel() {
        return this.model;
    }
    sendRequest(extraData = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `http://${this.config.server}:${this.config.port}${this.config.route}`;
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
exports.OllamaModel = OllamaModel;
