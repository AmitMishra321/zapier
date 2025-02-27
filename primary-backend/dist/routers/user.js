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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SignUpSchema.safeParse(body);
    if (!parsedData.success) {
        res.status(411).json({ message: "Incorrect Input" });
        return;
    }
    const { email, name, password } = parsedData.data;
    const userExists = yield db_1.prismaClient.user.findFirst({
        where: { email },
    });
    if (userExists) {
        res.status(403).send({ message: "User already exists" });
        return;
    }
    yield db_1.prismaClient.user.create({
        data: {
            email,
            name,
            password,
        },
    });
    //await sendEmail()
    res.status(201).json({ message: "Please verify your account" });
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SignInSchea.safeParse(body);
    if (!parsedData.success) {
        res.status(411).json({ message: "Incorrect Input" });
        return;
    }
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password,
        },
    });
    if (!user) {
        res.status(403).json({ message: "Unauthorize" });
    }
    //Sign the jwt
    const token = jsonwebtoken_1.default.sign({
        id: user === null || user === void 0 ? void 0 : user.id,
    }, config_1.JWT_PASSWORD);
    res.json({
        token,
    });
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: Fix the type
    //@ts-ignore
    const id = req.id;
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            id,
        },
        select: {
            name: true,
            email: true,
        },
    });
    res.json({
        user,
    });
}));
exports.userRouter = router;
