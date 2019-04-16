"use strict";

var const_val = function(){}

const_val.Action_Enter = 0 // 进入游戏


// 为了便于UI管理，globalUIMgr的ZOrder一定要大于curUIMgrZOrder
const_val.globalUIMgrZOrder = 90000
const_val.curUIMgrZOrder = 10000

const_val.MAX_LAYER_NUM = 99999999



const_val.MISSION_OPERATION = 1
const_val.GM_OPERATION = 4
const_val.SUMMON_OPERATION = 6

// 排行榜更新时间
const_val.RANK_DELTA_TIME = 15 * 60 // 15min
const_val.QUERY_PALYER_INFO_TIME = 15 * 60 // 15min

// const_val strings
const_val.sDefaultPortraitPath = "res/ui/GUI/image.png"
const_val.sClientDatas = "kbengine_js_demo"
const_val.sHasCreateQuickLoginAccount = "ccud_bHasCreateQuickLoginAccount"
const_val.sUseUploadedPortraitPrefix = "ccud_bUseUploadedPortrait_"
const_val.sAvatarPrefix = "res/avatars/avatar_"


const_val.nAvatarNum = 15

const_val.GameDelayTime = 10.0

const_val.TrusteeShipTurnNum = 2

const_val.OP_PASS             = 0 // 过
const_val.OP_DRAW             = 1 // 摸排
const_val.OP_DISCARD          = 2 // 打牌
const_val.OP_CHOW             = 3 // 吃
const_val.OP_PONG             = 4 // 碰
const_val.OP_EXPOSED_KONG     = 5 // 明杠
const_val.OP_CONCEALED_KONG   = 6 // 暗杠
const_val.OP_WIN              = 7 // 胡
const_val.OP_READY            = 8 // 听牌
const_val.OP_POST_KONG        = 9 // 放杠
const_val.OP_GET_KONG         = 10// 接杠
const_val.OP_KONG_WIN         = 11// 抢杠胡
const_val.OP_DRAW_END         = 12// 流局
const_val.OP_CUT              = 13 // 杠后切牌
const_val.OP_GIVE_WIN         = 14 // 放炮胡
const_val.OP_NUM              = 15 // 操作总数


// 万, 条, 筒
const_val.CHARACTER	= [1, 2, 3, 4, 5, 6, 7, 8, 9]
const_val.BAMBOO	= [11, 12, 13, 14, 15, 16, 17, 18, 19]
const_val.DOT		= [21, 22, 23, 24, 25, 26, 27, 28, 29]

// 红中, 发财, 白板
const_val.DRAGON_RED		= 35
const_val.DRAGON_GREEN		= 36
const_val.DRAGON_WHITE		= 37
const_val.DRAGONS = [const_val.DRAGON_RED, const_val.DRAGON_GREEN, const_val.DRAGON_WHITE]

// 东风, 南风, 西风, 北风
const_val.WIND_EAST	= 31
const_val.WIND_SOUTH	= 32
const_val.WIND_WEST	= 33
const_val.WIND_NORTH	= 34
const_val.WINDS = [const_val.WIND_EAST, const_val.WIND_SOUTH, const_val.WIND_WEST, const_val.WIND_NORTH]

const_val.MESSAGE_LIST = [
	"唉，一手烂牌臭到底",
	"不怕神一样的对手，就怕猪一样的队友",
	"和你合作真是太愉快啦",
	"投降输一半，速度投降吧",
	"快点吧，我等的花儿都谢了",
	"你的牌打得也太好了",
	"大清早的，鸡都还没叫，慌什么嘛",
	"吐了个槽的，整个一个杯具啊",
	"不要吵了，有什么好吵的，专心玩牌吧"
]

const_val.SIGNIN_MAX = 10

const_val.GAME_RECORD_MAX = 10

const_val.DISMISS_ROOM_WAIT_TIME = 100 // 申请解散房间后等待的时间, 单位为秒