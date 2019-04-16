# -*- coding: utf-8 -*-

import time
import re
import const
import copy
from KBEDebug import *
from datetime import datetime
from KBEDebug import *
import hashlib
import time
import AsyncRequest
import json
import switch

def get_count(tiles, t):
	return sum([1 for i in tiles if i == t])

def meld_with_pair_need_num(tiles, history):
	case1 = case2 = 999
	if meld_only_need_num(tiles, history) == 0:
		case1 = 2

	for i in tiles:
		tmp = list(tiles)
		if get_count(tiles, i) == 1:
			tmp.remove(i)
			case2 = min(case2, 1 + meld_only_need_num(tmp, history))
		else:
			tmp.remove(i)
			tmp.remove(i)
			case2 = min(case2, meld_only_need_num(tmp, history))

	return min(case1, case2)

def meld_only_need_num(tiles, history, used = 0):
	if used > 4:
		return 999
	tiles = sorted(tiles)
	key = tuple(tiles)
	if key in history.keys():
		return history[key]

	size = len(tiles)
	if size == 0:
		return 0
	if size == 1:
		return 2
	if size == 2:
		p1, p2 = tiles[:2]
		case1 = 999
		if not(p1 == 9 or p1 == 19 or p1 >= 29):
			if p2 - p1 <= 2:
				case1 = 1
		case2 = 0
		if p1 == p2:
			case2 = 1
		else:
			case2 = 4
		return min(case1, case2)
		# if p1 == p2 or p2 - p1 <= 2:
		# 	return 1
		# else:
		# 	return 4

	first = tiles[0]
	# 自己组成顺子
	left1 = list(tiles[1:])
	case1 = 0
	if first == 9 or first == 19 or first >= 29:
		case1 = 999
	else:
		if first+1 in left1:
			left1.remove(first+1)
		else:
			case1 += 1
		if first+2 in left1:
			left1.remove(first+2)
		else:
			case1 += 1
		res1 = meld_only_need_num(left1, history)
		history[tuple(left1)] = res1
		case1 += res1

	# 自己组成刻子
	left2 = list(tiles[1:])
	case2 = 0
	count = get_count(left2, first)
	if count >= 2:
		left2.remove(first)
		left2.remove(first)
	elif count == 1:
		left2.remove(first)
		case2 += 1
	else:
		case2 += 2
	res2 = meld_only_need_num(left2, history)
	history[tuple(left2)] = res2
	case2 += res2
	result = min(case1, case2)
	history[tuple(tiles)] = result
	return result

def is_same_day(ts1, ts2):
	d1 = datetime.fromtimestamp(ts1)
	d2 = datetime.fromtimestamp(ts2)

	if (d1.year, d1.month, d1.day) == (d2.year, d2.month, d2.day):
		return True
	return False

def gen_room_id(kbe_pid):
	return 100168 + kbe_pid

def filter_emoji(nickname):
	try:
		# UCS-4
		highpoints = re.compile(u'[\U00010000-\U0010ffff]')
	except re.error:
		# UCS-2
		highpoints = re.compile(u'[\uD800-\uDBFF][\uDC00-\uDFFF]')
	nickname = highpoints.sub(u'', nickname)
	return nickname

def classifyTiles(tiles, kingTile):
	kings = []
	dragon_white = []
	chars = []
	bambs = []
	dots = []
	winds = []
	dragon_red_green = []

	tiles = sorted(tiles)
	for t in tiles:
		if t == kingTile:
			kings.append(t)
		elif t == const.DRAGON_WHITE:
			dragon_white.append(t)
		elif t in const.CHARACTER:
			chars.append(t)
		elif t in const.BAMBOO:
			bambs.append(t)
		elif t in const.DOT:
			dots.append(t)
		elif t in const.WINDS:
			winds.append(t)
		elif t in const.DRAGONS:
			dragon_red_green.append(t)
	return [kings, dragon_white, chars, bambs, dots, winds, dragon_red_green]

def classifyTiles4Type(tiles):
	chars = []
	bambs = []
	dots = []
	winds_dragons = []
	tiles = sorted(tiles)
	for t in tiles:
		if t in const.CHARACTER:
			chars.append(t)
		elif t in const.BAMBOO:
			bambs.append(t)
		elif t in const.DOT:
			dots.append(t)
		elif t in const.WINDS or t in const.DRAGONS:
			winds_dragons.append(t)
	return [chars, bambs, dots, winds_dragons]

def classifyTiles3Type(tiles):
	chars = []
	bambs = []
	dots = []
	tiles = sorted(tiles)
	for t in tiles:
		if t in const.CHARACTER:
			chars.append(t)
		elif t in const.BAMBOO:
			bambs.append(t)
		elif t in const.DOT:
			dots.append(t)
	return [chars, bambs, dots]

def getTile2NumDict(tiles):
	tile2NumDict = {}
	for t in tiles:
		if t not in tile2NumDict:
			tile2NumDict[t] = 1
		else:
			tile2NumDict[t] += 1
	return tile2NumDict

def getPairNum(tiles, isContainTriple = False, isContainKong = False):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	for tile in tile2NumDict:
		if tile2NumDict[tile] == 2:
			num += 1
		elif tile2NumDict[tile] == 3 and isContainTriple:
			num += 1
		elif tile2NumDict[tile] == 4 and isContainKong:
			num += 2
	return num

def getKongNum(tiles):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	for tile in tile2NumDict:
		if tile2NumDict[tile] == 4:
			num += 1
	return num

def getTileNum(tiles, aimTile):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	if aimTile in tile2NumDict:
		num = tile2NumDict[aimTile]
	return num

#胡 —— 乱风：14张全部东南西北中发白 成型后胡牌,摸到财神也可以胡（清牌）/ tiles 14张牌
def checkCanWinAllWindDragon(handTiles, uptiles, kingTile):
	if len(handTiles)%3 != 2:
		return False

	for t in handTiles:
		if t != kingTile and t not in const.WINDS and t not in const.DRAGONS:
			return False

	for t in uptiles:
		if t != kingTile and t not in const.WINDS and t not in const.DRAGONS:
			return False
	return True

#胡 —— 四道杠：桌牌 4个杠子 就可以胡
def checkCanWinFourKong(handTiles, uptiles):
	if len(handTiles)%3 != 2:
		return False
	if len(uptiles) < 16:
		return False
	tile2NumDict = {}
	for t in uptiles:
		if t not in tile2NumDict:
			tile2NumDict[t] = 1
		else:
			tile2NumDict[t] += 1
	for tile in tile2NumDict:
		if tile2NumDict[tile] < 4:
			return False
	return True

#从操作列表找 十风张数
def getTenWindDragonNum(player_op_r):
	num = 0
	for i in range(0, len(player_op_r))[::-1]:
		if player_op_r[i][0] == const.OP_DISCARD:
			if player_op_r[i][1][0] not in const.WINDS and player_op_r[i][1][0] not in const.DRAGONS:
				break
			num += 1
	return num

#胡 —— 十风：连续打出十张风牌
def getCanWinTenWindDragonNum(handTiles, player_op_r):
	if len(handTiles)%3 != 2:
		return 0
	if getTenWindDragonNum(player_op_r) < 10:
		return 0
	return getTenWindDragonNum(player_op_r) - 9

#是否是7对(handTilesButKing = 除财神外手上所有牌)
def checkIs7Pairs(handTilesButKing, kingTileNum):
	if len(handTilesButKing) + kingTileNum != 14:
		return False
	pairNum = getPairNum(handTilesButKing, True, True)
	needNum = len(handTilesButKing) - pairNum*2
	if (kingTileNum > 0 and kingTileNum >= needNum) or needNum == 0:
		return True
	return False

#判断是否可以胡7对，七对可以杠 (handTilesButKing = 除财神外手上所有牌, 萧山麻将 清一色不必爆头)
def checkCanWin7Pairs(listButKing, kingTilesNum, kingTile, finalDrawTile, isFlush  = False):
	if finalDrawTile == kingTile and not isFlush:
		return False
	if not checkIs7Pairs(listButKing, kingTilesNum):
		return False
	if not isFlush and not getTileNum(listButKing, finalDrawTile)%2 == 1:
		return False
	return True

#是否是大对子(碰碰胡)（不判断是否能胡）// 全部是碰子或杠子 // 白板 在不考虑顺子的情况下 也可以无视
def checkIsBigPair(listButKing, uptiles, kingTile, kingTilesNum):
	if kingTilesNum >= 2:
		return False
	for i in range(len(uptiles)):
		if i+2 < len(uptiles) and uptiles[i] != uptiles[i+1] and uptiles[i+1] != uptiles[i+2]:
			return False

	tile2NumDict = getTile2NumDict(listButKing)
	numList = [0, 0, 0, 0]
	for tile in tile2NumDict:
		num = tile2NumDict[tile]
		numList[num -1] += 1

	if kingTilesNum == 1:
		if numList[0] != 1 or numList[1] > 0:
			return False
	else:
		if numList[0] > 0 or numList[1] != 1:
			return False
	return True

#清一色	（不判断是否能胡）
def checkIsFlush(handTiles, upTiles, kingTile):
	allTiles = copy.deepcopy(handTiles)
	allTiles.extend(upTiles)
	flushList = [const.CHARACTER, const.BAMBOO, const.DOT]
	index = -1
	for i in range(len(allTiles)):
		tile = allTiles[i]
		if (tile in const.DRAGONS or tile in const.WINDS) and tile != kingTile:
			return False
		#查找清一色类型
		if tile != kingTile and index < 0:
			for j in range(len(flushList)):
				if tile in flushList[j]:
					index = j
					break
		#不是财神看索引
		if tile != kingTile:
			if index < 0:
				return False
			if tile not in flushList[index]:
				return False
	return True

#财几飘 （不判断是否能胡）
def getDiscardSerialKingTileNum(player_op_r, handTiles, kingTile):
	num = 0
	if kingTile not in handTiles:
		return num
	for i in range(0, len(player_op_r))[::-1]:
		if player_op_r[i][0] == const.OP_DISCARD:
			if player_op_r[i][1][0] == kingTile:
				num += 1
			else:
				return num
	return num

# 暗杠开 明杠开
def getNearlyKongType(player_op_r):
	for i in range(0, len(player_op_r))[::-1]:
		if player_op_r[i][0] == const.OP_DRAW or player_op_r[i][0] == const.OP_CUT:
			continue
		if player_op_r[i][0] == const.OP_CONCEALED_KONG:
			return 1
		elif player_op_r[i][0] == const.OP_EXPOSED_KONG:
			return 2
		return 0
	return 0

def getDiscardNum(player_op_r):
	discardNum = 0
	for i in range(0, len(player_op_r))[::-1]:
		if player_op_r[i][0] == const.OP_DISCARD:
			discardNum += 1
	return discardNum 

def removeTriple(tiles, kingTileNum = 0):
	newTiles = copy.deepcopy(tiles)
	newTiles = sorted(newTiles)
	for i in range(len(newTiles)):
		t = newTiles[i]
		if i+2 < len(newTiles) and newTiles[i] == newTiles[i+1] and newTiles[i+1] == newTiles[i+2]:
			newList = newTiles[0:i] + newTiles[i+3:]
			return [newList, kingTileNum, True]
		elif i+1 < len(newTiles) and newTiles[i] == newTiles[i+1] and kingTileNum >= 1:
			kingTileNum -= 1
			newList = newTiles[0:i] + newTiles[i+2:]
			return [newList, kingTileNum, True]
		elif kingTileNum >= 2:
			kingTileNum -= 2
			newList = newTiles[0:i] + newTiles[i+1:]
			return[newList, kingTileNum, True]
	return [newTiles, kingTileNum, False]


def check_wind_dragon(listWindDragon, kingTilesNum):
	result = removeTriple(listWindDragon, kingTilesNum)
	kingTilesNum = result[1]
	if result[2]:
		result = check_wind_dragon(result[0], kingTilesNum)
	return result

def loop2Win(delPairList, kingTilesNum):
	if len(delPairList) <= 0:
		if kingTilesNum <= 0:
			return True
		return False
	classfyList = classifyTiles4Type(delPairList)
	listExceptWindDragon = []
	listWindDragon = []
	listExceptWindDragon = classfyList[0][0:] + classfyList[1][0:] + classfyList[2][0:]
	listWindDragon = classfyList[3][0:]

	result = check_wind_dragon(listWindDragon, kingTilesNum)
	windDragonPairNum = getPairNum(result[0])
	kingTilesNum = result[1]
	if len(result[0]) * 2 - windDragonPairNum * 3 > kingTilesNum:
		return False
	needNum = meld_only_need_num(listExceptWindDragon, {})
	if needNum > kingTilesNum:
		return False
	return True

def checkIsWin(listButKingWhite, kingTilesNum, dragonWhiteNum, kingTile, finalDrawTile, isFlush):
	if (len(listButKingWhite) + kingTilesNum + dragonWhiteNum)%3 != 2 or (kingTile == finalDrawTile and not isFlush):
		return False

	handTilesButKing = copy.deepcopy(listButKingWhite)
	dragonWhiteList = [const.DRAGON_WHITE] * dragonWhiteNum
	handTilesButKing.extend(dragonWhiteList)

	if checkCanWin7Pairs(handTilesButKing, kingTilesNum, kingTile, finalDrawTile, isFlush):
		return True

	listButKingWhite = sorted(listButKingWhite)

	#n个白板当财神使
	newList = copy.deepcopy(listButKingWhite)
	for i in range(0, dragonWhiteNum+1): #i = 0 没有白板当财神使
		copyList = copy.deepcopy(newList)
		#添加当财神的白板 和 不当财神的白板
		for j in range(1,dragonWhiteNum+1):
			if j > i:
				copyList.append(kingTile)
			else:
				copyList.append(const.DRAGON_WHITE)
		#排序
		copyList = sorted(copyList)
		kingNum = kingTilesNum
		if kingNum > 0:
			kingNum -= 1
			for k in range(len(copyList)):
				if copyList[k] != finalDrawTile:
					continue
				delPairList = copyList[0:k] + copyList[k+1:]
				if loop2Win(delPairList, kingNum):
					return True
		else:
			#删除一对后判断是否可以胡
			for k in range(len(copyList)):
				if k+1 <= len(copyList) and copyList[k] == copyList[k+1]:
					delPairList = copyList[0:k] + copyList[k+2:]
					if loop2Win(delPairList, 0):
						return True
	return False

def getXSMJCreateRoomInfo(createRoomInfoList):
	maxOldDealNum, startOldDealNum, diceAddNum, isSameAdd, maxLoseScore, is_agent = 3,2,0,0,0,0
	if createRoomInfoList[0] == 0:
		maxOldDealNum = 3
	elif createRoomInfoList[0] == 1:
		maxOldDealNum = -1
	else:
		maxOldDealNum = 3

	if createRoomInfoList[1] == 0:
		startOldDealNum = 2
	elif createRoomInfoList[1] == 1:
		startOldDealNum = 3
	elif createRoomInfoList[1] == 2:
		startOldDealNum = 2
		diceAddNum = 8
		isSameAdd = 1
	elif createRoomInfoList[1] == 3:
		startOldDealNum = 2
		diceAddNum = 10
		isSameAdd = 1
	else:
		startOldDealNum = 2
		diceAddNum = 0
		isSameAdd = 0

	return maxOldDealNum, startOldDealNum, diceAddNum, isSameAdd, maxLoseScore, is_agent

#是否是十三幺
def check_Is_13_WindDragon(tiles):
	if len(tiles) != 14:
		return False
	win_list = [const.CHAR1, const.CHAR9, const.BAMB1, const.BAMB9, const.DOT1, const.DOT9, const.WIND_EAST, const.WIND_SOUTH, const.WIND_WEST, const.WIND_NORTH, const.DRAGON_RED, const.DRAGON_GREEN, const.DRAGON_WHITE]
	own_list = [0] * len(win_list)
	for i in range(len(tiles)):
		tile = tiles[i]
		if tile not in win_list:
			return False
		own_list[win_list.index(tile)] += 1
	for i in range(len(own_list)):
		if own_list <= 0:
			return False
	return True
	return maxOldDealNum, startOldDealNum, diceAddNum, isSameAdd, maxLoseScore, is_agent

# 发送网络请求
def get_user_info(accountName, callback):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	url = switch.PHP_SERVER_URL + 'user_info_server'
	suffix = '?timestamp=' + str(ts) + '&unionid=' + accountName + '&sign=' + sign
	AsyncRequest.Request(url + suffix, lambda x:callback(x.read()) if x else DEBUG_MSG(url + suffix + " error!"))

def update_card_diamond(accountName, deltaCard, deltaDiamond, callback, reason = ""):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + str(deltaCard) + "_" + str(deltaDiamond) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	DEBUG_MSG("MD5::" +sign)
	url = switch.PHP_SERVER_URL + 'update_card_diamond'
	data = {
		"timestamp" : ts,
		"delta_card" : deltaCard,
		"delta_diamond" : deltaDiamond,
		"unionid" : accountName,
		"sign" : sign,
		"reason" : reason
	}
	AsyncRequest.Post(url, data, lambda x:callback(x.read()) if x else DEBUG_MSG(url + str(data) + " error!"))