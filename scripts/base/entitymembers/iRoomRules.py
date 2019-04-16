# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import utility as util
import const
import copy
import random

class iRoomRules(object):

	def __init__(self):
		# 房间的牌堆
		self.tiles = []
		self.lucky_set = (const.CHAR1, const.CHAR5, const.CHAR9,
		                  const.BAMB1, const.BAMB5, const.BAMB9,
		                  const.DOT1, const.DOT5, const.DOT9, const.DRAGON_RED)
		self.meld_dict = dict()

	def initTiles(self):
		self.tiles = const.CHARACTER * 4 + const.BAMBOO * 4 + const.DOT * 4
		self.shuffle_tiles()
		#测试代码
		#1 连续出同一张牌，第二张牌不能碰
		# self.tiles = const.CHARACTER * 4 + const.BAMBOO * 4 + const.DOT * 4 + [const.WIND_EAST, const.WIND_SOUTH, const.WIND_WEST, const.WIND_NORTH] * 4 + [const.DRAGON_RED, const.DRAGON_GREEN] * 4
		# self.shuffle_tiles()
		# self.tiles.insert(0, const.DRAGON_WHITE)
		# self.tiles.insert(1, const.DRAGON_WHITE)
		# self.tiles.insert(2, const.DRAGON_WHITE)
		# self.tiles.insert(6, const.DRAGON_WHITE)

	def shuffle_tiles(self):
		random.shuffle(self.tiles)

	def swapTileToTop(self, tile):
		if tile in self.tiles:
			tileIdx = self.tiles.index(tile)
			self.tiles[0], self.tiles[tileIdx] = self.tiles[tileIdx], self.tiles[0]

	def winCount(self):
		pass

	def canOperationByKingTile(self, curIdx):
		"""打出财神后是否可以操作"""
		if self.discardKingTileIdx < 0:
			return True
		elif curIdx == self.discardKingTileIdx:
			return True
		return False

	def canOperationByTimesLimit(self, curIdx):
		"""萧山麻将同一家不能吃碰杠超过两次"""
		if curIdx is None:
			return True
		numList = [0] * 4
		for i, record in enumerate(self.players_list[curIdx].op_r):
			if record[2] != curIdx and record[0] in [const.OP_CHOW, const.OP_PONG, const.OP_EXPOSED_KONG]:
				numList[record[2]] += 1
		if numList[self.last_player_idx] >= 2:
			return False
		return True
		
	def can_cut_after_kong(self):
		return True

	def can_discard(self, tiles, t):
		if t in tiles:
			return True
		return False

	def can_chow(self, tiles, t, pIdx = None):
		return False
		# if not self.canOperationByTimesLimit(pIdx):
		# 	return False
		# if not self.canOperationByKingTile(pIdx):
		# 	return False
		if self.last_player_idx != (pIdx + 3)%4:
			return False
		if t >= 30:
			return False
		neighborTileNumList = [0, 0, 1, 0, 0]
		for i in range(len(tiles)):
			if (tiles[i] - t >= -2 and tiles[i] - t <= 2):
				neighborTileNumList[tiles[i] - t + 2] += 1
		for i in range(0,3):
			tileNum = 0
			for j in range(i,i+3):
				if neighborTileNumList[j] > 0:
					tileNum += 1
				else:
					break
			if tileNum >= 3:
				return True
		return False

	def can_chow_one(self, tiles, tile_list, pIdx = None):
		return False
		""" 能吃 """
		# if not self.canOperationByTimesLimit(pIdx):
		# 	return False
		# if not self.canOperationByKingTile(pIdx):
		# 	return False
		if self.last_player_idx != (pIdx + 3)%4:
			return False
		if tile_list[0] >= 30:
			return False
		if sum([1 for i in tiles if i == tile_list[1]]) >= 1 and sum([1 for i in tiles if i == tile_list[2]]) >= 1:
			sortLis = sorted(tile_list)
			if (sortLis[2] + sortLis[0])/2 == sortLis[1] and sortLis[2] - sortLis[0] == 2:
				return True
		return False

	def can_pong(self, tiles, t, pIdx = None):
		""" 能碰 """
		# if not self.canOperationByTimesLimit(pIdx):
		# 	DEBUG_MSG("can not pong can'tOperationByTimesLimit")
		# 	return False
		# if not self.canOperationByKingTile(pIdx):
		# 	DEBUG_MSG("can not pong can'tOperationByKingTile")
		# 	return False
		# if self.getSerialSameTileNum() >= 2: #萧山麻将 上下家同时打出一张牌，上家未操作，下家打出也不行
		# 	DEBUG_MSG("can not pong getSerialSameTileNum >= 2")
		# 	return False
		return sum([1 for i in tiles if i == t]) >= 2

	def getSerialSameTileNum(self):
		"""
		获取上下家打出同一张牌的张数
		"""
		if len(self.op_record) <= 0 or self.op_record[-1][0] != const.OP_DISCARD:
			return 0

		playerDiscardList = []
		for i in range(0, len(self.op_record))[::-1]:
			if len(playerDiscardList) >= 2:
				break
			if self.op_record[i][0] == const.OP_DISCARD:
				playerDiscardList.append(self.op_record[i])

		if len(playerDiscardList) >= 2 and playerDiscardList[-1][3] == playerDiscardList[-2][3]: # A AA A 碰出打法会判断下家可以碰，但麻将不会有相同6张
			return 2
		return 1

	def can_exposed_kong(self, tiles, t, pIdx = None):
		""" 能明杠 """
		# if not self.canOperationByTimesLimit(pIdx):
		# 	return False
		# if not self.canOperationByKingTile(pIdx):
		# 	return False
		return util.get_count(tiles, t) == 3

	def can_self_exposed_kong(self, player, t):
		""" 自摸的牌能够明杠 """
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
				return True
		return False

	def can_concealed_kong(self, tiles, t):
		""" 能暗杠 """
		return util.get_count(tiles, t) == 4

	# def can_win(self, tiles):
	# 	""" 能胡牌 """
	# 	if len(tiles) % 3 != 2:
	# 		return False

	# 	tiles = sorted(tiles)
	# 	chars, bambs, dots, dragon_red = self.classify_tiles(tiles)

	# 	c_need1 = util.meld_only_need_num(chars, self.meld_dict)
	# 	c_need2 = util.meld_with_pair_need_num(chars, self.meld_dict)
	# 	if c_need1 > dragon_red and c_need2 > dragon_red:
	# 		return False

	# 	b_need1 = util.meld_only_need_num(bambs, self.meld_dict)
	# 	b_need2 = util.meld_with_pair_need_num(bambs, self.meld_dict)
	# 	if b_need1 > dragon_red and b_need2 > dragon_red:
	# 		return False

	# 	d_need1 = util.meld_only_need_num(dots, self.meld_dict)
	# 	d_need2 = util.meld_with_pair_need_num(dots, self.meld_dict)
	# 	if d_need1 > dragon_red and d_need2 > dragon_red:
	# 		return False

	# 	if  c_need2 + b_need1 + d_need1 <= dragon_red or\
	# 		c_need1 + b_need2 + d_need1 <= dragon_red or\
	# 		c_need1 + b_need1 + d_need2 <= dragon_red:
	# 		return True
	# 	return False

	def first_hand_win(self, tiles):
		return sum([1 for t in tiles if t == const.DRAGON_RED]) == 4

	# def cal_lucky_tile(self, win_tiles, lucky_tile):
	# 	return [], 0
	# 	if lucky_tile == 1:
	# 		# 一码全中
	# 		if len(self.tiles) > 0:
	# 			final = self.tiles[0]
	# 			self.tiles = self.tiles[1:]
	# 			return [final], 10 if final == const.DRAGON_RED else final%10
	# 		else:
	# 			return [], 0
	# 	else:
	# 		if util.get_count(win_tiles, const.DRAGON_RED) == 0:
	# 			lucky_tile += 1

	# 		final = min(len(self.tiles), lucky_tile)
	# 		see_tiles = []
	# 		count = 0
	# 		for i in range(final):
	# 			t = self.tiles[0]
	# 			self.tiles = self.tiles[1:]
	# 			see_tiles.append(t)
	# 			if t in self.lucky_set:
	# 				count += 1
	# 		return see_tiles, count

	def cal_lucky_tile_hit(self, key_tiles):
		hit = 0
		for tile in key_tiles:
			if tile == const.CHAR1 or tile == const.CHAR5 or tile == const.CHAR9:
				hit += 1
			elif tile == const.DOT1 or tile == const.DOT5 or tile == const.DOT9:
				hit += 1
			elif tile == const.BAMB1 or tile == const.BAMB5 or tile == const.BAMB9:
				hit += 1
		return hit

	def classify_tiles(self, tiles):
		chars = []
		bambs = []
		dots  = []
		dragon_red = 0
		for t in tiles:
			if t in const.CHARACTER:
				chars.append(t)
			elif t in const.BAMBOO:
				bambs.append(t)
			elif t in const.DOT:
				dots.append(t)
			elif t == const.DRAGON_RED:
				dragon_red += 1
			else:
				DEBUG_MSG("iRoomRules classify tiles failed, no this tile %s"%t)
		return chars, bambs, dots, dragon_red

	# def can_win(self, handTiles, winType, idx): #winType 胡的类型 0-自摸 , 1-抢杠 , 2-放炮
	# 	""" 能胡牌 """
	# 	resultDesList = ["自摸","抢杠","放炮","天胡","地胡","7对","清一色","碰碰胡","单吊","杠开"]
	# 	resultList = [0]*len(resultDesList)

	# 	if len(handTiles) % 3 != 2:
	# 		return resultList

	# 	handTiles = sorted(handTiles)
		
	# 	finalDrawTile = self.players_list[idx].last_draw
	# 	upTiles = self.players_list[idx].upTiles
	# 	player_op_r = self.players_list[idx].op_r

	# 	#chars, bambs, dots
	# 	classifyList = util.classifyTiles3Type(handTiles)

	# 	#七对
	# 	if util.checkIs7Pairs(handTiles, 0):
	# 		resultList[5] = 1
	# 		resultList[5] += util.getKongNum(handTiles)

	# 	#可以胡
	# 	if util.meld_with_pair_need_num(handTiles, {}) <= 0 or resultList[5] > 0:
	# 		#天胡 地胡
	# 		discardNum = util.getDiscardNum(player_op_r)
	# 		if discardNum <= 0 and len(handTiles) == 14:
	# 			if self.dealer_idx == idx:
	# 				resultList[3] = 1
	# 			else:
	# 				resultList[4] = 1
	# 		#清一色
	# 		DEBUG_MSG("check is flush,handTiles:{0},upTiles:{1}".format(str(handTiles), str(upTiles)))
	# 		if util.checkIsFlush(handTiles, upTiles, 0):
	# 			resultList[6] = 1
	# 		#碰碰胡
	# 		if util.checkIsBigPair(handTiles, upTiles, 0, 0):
	# 			resultList[7] = 1

	# 		# 天胡 地胡 七对 清一色 碰碰胡 允许放炮
	# 		#其他牌型只在放炮模式下才能放炮胡
	# 		isCanEatWin = False
	# 		if resultList[3] | resultList[4] | resultList[5] | resultList[6] | resultList[7] > 0:
	# 			isCanEatWin = True
	# 		if winType == 2 and self.roomMode == 1:
	# 			isCanEatWin = True

	# 		if winType != 2 or isCanEatWin:
	# 			#单吊
	# 			if len(handTiles) <= 2:
	# 				resultList[8] = 1
	# 			#杠开
	# 			if winType <= 0:
	# 				kongWinNum = util.getNearlyKongType(player_op_r)
	# 				if kongWinNum > 0:
	# 					resultList[9] = 1

	# 			resultList[winType] = 1
	# 		DEBUG_MSG("check nomal win, wintype is{0}".format(str(winType)))
	# 	DEBUG_MSG("check can win, result is:{0}".format(str(resultList)))
	# 	return resultList

	def can_win(self, handTiles):
		if len(handTiles) % 3 != 2:
			return False
		copyTiles = handTiles[:]
		copyTiles = sorted(copyTiles)
		if util.meld_with_pair_need_num(copyTiles, {}) <= 0:
			return True
		return False

	def cal_multiple(self, resultList): # tips 10代表清牌 = 2^1024
		"""计算番数"""
		#"自摸","抢杠","放炮","天胡","地胡","7对","清一色","碰碰胡","单吊","杠开"
		mutipleList = [1, 1, 0, 1, 1, 1, 1, 1, 1, 1]

		mutipleNum = 0
		for i in range(len(resultList)):
			mutipleNum += resultList[i] * mutipleList[i]
		return mutipleNum

