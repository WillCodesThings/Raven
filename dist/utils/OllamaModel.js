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
    constructor(model, server, port, name, route = "/generate", method = "POST") {
        this.model = model;
        this.config = {
            server,
            port,
            name,
            route,
            method
        };
        this.messages = [];
    }
    addMessage(message) {
        this.messages.push(message);
    }
    getMessages() {
        return this.messages;
    }
    generate(prompt, options = {}, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addMessage({
                role: "user",
                message: prompt,
            });
            // Simulate a response from the model
            fetch(`http://${this.config.server}:${this.config.port}${this.config.route}`, {
                method: this.config.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: this.messages }),
            }).then((response) => response.json());
        });
    }
    getModel() {
        return this.model;
    }
}
exports.OllamaModel = OllamaModel;
