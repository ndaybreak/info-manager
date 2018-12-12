<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.accountNumber"></el-input>
      <el-select class="filter-item" v-model="query.status" placeholder="请选择订单状态" @change="handleFilter">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" v-model="query.targetCoinId" placeholder="请选择基础币种" @change="handleFilter">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" v-model="query.marketCoinId" placeholder="请选择计价币种" @change="handleFilter">
        <el-option v-for="item in marketCoinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.startTime" class="filter-item" type="datetime" placeholder="请输入开始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="订单编号" width="150" prop="orderNo"></el-table-column>
      <el-table-column align="center" label="订单日期" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.orderTime | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单状态" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱" width="250" prop="email"></el-table-column>
      <el-table-column align="center" label="手机" width="150" prop="mobileNumber"></el-table-column>
      <el-table-column align="center" label="交易对" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.targetCoinCode}}/{{scope.row.marketCoinCode}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="买卖方向" width="80">
        <template slot-scope="scope">
          <span>{{scope.row.tradeType | typeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="数量" width="100" prop="quantity"></el-table-column>
      <el-table-column align="center" label="价格" width="100" prop="price"></el-table-column>
      <el-table-column align="center" label="总额" width="100" prop="totalAmount"></el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  // import { getMarketCoinList } from '@/api/customer'
  import { getCoinList } from '@/api/customer'
  import { coin2coinFetchAll } from '@/api/query'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'otcDeal',
    directives: {
      waves
    },
    filters: {
      typeFilter(val) {
        const map = {
          1: '买',
          2: '卖'
        }
        return map[val]
      },
      statusFilter(val) {
        const map = {
          0: '新增',
          1: '已撤销',
          2: '部分成交',
          3: '已成交'
        }
        return map[val]
      }
    },
    data() {
      return {
        statusList: [{
          id: '',
          label: '全部'
        }, {
          id: 0,
          label: '新增'
        }, {
          id: 1,
          label: '已撤销'
        }, {
          id: 2,
          label: '部分成交'
        }, {
          id: 3,
          label: '已成交'
        }],
        list: null,
        listLoading: true,
        total: null,
        query: {
          currPage: 1,
          pageSize: 15,
          isDeleted: false,
          status: ''
        },
        coinList: [],
        marketCoinList: []
      }
    },
    created() {
      getCoinList().then(result => {
        this.coinList = result.data
      })
      getCoinList({ isMainCoin: true }).then(result => {
        this.marketCoinList = result.data
      })
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.startTime) {
          para.startTime = para.startTime.getTime() / 1000
        }
        if (para.endTime) {
          para.endTime = para.endTime.getTime() / 1000
        }
        coin2coinFetchAll(para).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleSizeChange(val) {
        this.query.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.query.currPage = val
        this.getList()
      }
    }
  }
</script>
<style scoped>

</style>
