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
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    //@ts-ignore
    const id = req.id;
    const body = req.body;
    const parseData = types_1.ZapCreateSchema.safeParse(body);
    if (!parseData.success) {
        res.status(411).json({
            message: "Incorrect Inputs",
        });
        return;
    }
    const zapId = yield db_1.prismaClient.zap.create({
        data: {
            userId: id,
            triggerId: (_a = parseData.data) === null || _a === void 0 ? void 0 : _a.availableTriggerId,
            trigger: {
                create: {
                    triggerId: (_b = parseData.data) === null || _b === void 0 ? void 0 : _b.availableTriggerId,
                },
            },
            actions: {
                create: (_c = parseData.data) === null || _c === void 0 ? void 0 : _c.actions.map((x, index) => ({
                    actionId: x.availableActionId,
                    sortingOrder: index,
                })),
            },
        },
    });
    res.json({ zapId: zapId.id });
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: id,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    res.json({ zaps });
}));
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: id,
            id: zapId,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    res.json({ zaps });
}));
exports.zapRouter = router;
