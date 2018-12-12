<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.accountId"></el-input>-->
      <el-select clearable class="filter-item" v-model="query.coinId" placeholder="请选择数字币" @change="handleFilter">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入充值地址" v-model="query.toAddress"></el-input>
      <el-select clearable class="filter-item" v-model="query.status" placeholder="请选择充值结果" @change="handleFilter">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.startTime" class="filter-item" type="datetime" placeholder="请输入开始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <!--<el-table-column align="center" label="UID" width="80" prop="account_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="150" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="60" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="120" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="数字币" width="80" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="充值结果" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.status | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="转入地址" width="150" prop="from_address"></el-table-column>
      <el-table-column align="center" label="充值地址" width="150" prop="to_address"></el-table-column>
      <el-table-column align="center" label="区块链ID" width="150" prop="tx_hash"></el-table-column>
      <el-table-column align="center" label="区块" width="150" prop="block"></el-table-column>
      <el-table-column align="center" label="数量" width="150" prop="quantity"></el-table-column>
      <el-table-column align="center" label="备注" width="150" prop="info"></el-table-column>
      <el-table-column align="center" label="充值日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.time | parseTime}}</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import { getCoinList } from '@/api/customer'
  import { rechargeFetchAll } from '@/api/audit'
  import waves from '@/directive/waves' // 水波纹指令
  import { parseTime } from '@/utils'

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
          1: '成功',
          2: '失败'
        }
        return map[val]
      }
    },
    data() {
      return {
        statusList: [{
          id: 1,
          label: '成功'
        }, {
          id: 2,
          label: '失败'
        }],
        list: null,
        listLoading: true,
        total: null,
        query: {
          currPage: 1,
          pageSize: 15
        },
        coinList: []
      }
    },
    created() {
      getCoinList().then(result => {
        this.coinList = result.data
      })
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        const para = Object.assign({}, this.query)
        if (para.startTime) {
          para.startTime = parseTime(para.startTime)
        }
        if (para.endTime) {
          para.endTime = parseTime(para.endTime)
        }
        rechargeFetchAll(para).then(result => {
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
