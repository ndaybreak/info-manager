<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.accountId"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.account"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.operationType" @change="handleFilter" placeholder="请选择操作类型">
        <el-option v-for="item in typeList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.coinId" @change="handleFilter" placeholder="请选择数字币">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入变动原因" v-model="query.info"></el-input>
      <el-date-picker v-model="query.startTime" class="filter-item" type="datetime" placeholder="请输入起始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.time | parseTime}}</span>
        </template>
      </el-table-column>
      <!--<el-table-column align="center" label="UID" width="100" prop="account_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="180" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="80" prop="area_code"></el-table-column>
      <el-table-column align="center" label="手机号" width="110" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="操作类型" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.operation_type | typeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="具体操作类型" width="150" prop="operation_type_detail">
        <template slot-scope="scope">
          <span>{{scope.row.operation_type_detail | detailFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="变动原因" width="150" prop="info"></el-table-column>
      <el-table-column align="center" label="数字币" width="100" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="总额变动" width="120" prop="total_balance_change"></el-table-column>
      <el-table-column align="center" label="冻结余额变动" width="150" prop="frozen_balance_change"></el-table-column>
      <el-table-column align="center" label="冻结余额" width="120" prop="frozen_balance"></el-table-column>
      <el-table-column align="center" label="可用余额" width="120" prop="available_balance"></el-table-column>
      <el-table-column align="center" label="总额" width="120" prop="total_balance"></el-table-column>
      <el-table-column align="center" label="可用余额变动" width="120" prop="available_balance_change"></el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import { customerAssetChangeLog } from '@/api/query'
  import { getCoinList } from '@/api/customer'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'merchantDepositLog',
    directives: {
      waves
    },
    filters: {
      typeFilter(status) {
        const typeMap = {
          1: '充值',
          2: '取现',
          3: '币币交易',
          4: '广告',
          5: '法币交易',
          6: '保证金',
          7: '系统操作'
        }
        return typeMap[status]
      },
      detailFilter(status) {
        const typeMap = {
          '101': '成功',
          '201': '申请',
          '202': '拒绝',
          '203': '成功',
          '204': '失败',
          '301': '下单',
          '302': '撤单',
          '303': '支出',
          '304': '收入',
          '305': '分佣收入',
          '401': '发布',
          '501': '下单',
          '502': '撤单',
          '503': '支出',
          '504': '收入',
          '601': '缴纳',
          '602': '返还',
          '701': '调增',
          '702': '调减'
        }
        return typeMap[status]
      }
    },
    data() {
      return {
        list: null,
        listLoading: true,
        total: null,
        query: {
          currPage: 1,
          pageSize: 15
        },
        typeList: [{
          id: 1,
          label: '充值'
        }, {
          id: 2,
          label: '取现'
        }, {
          id: 3,
          label: '币币交易'
        }, {
          id: 4,
          label: '广告'
        }, {
          id: 5,
          label: '法币交易'
        },
        //   {
        //   id: 6,
        //   label: '保证金'
        // },
        {
          id: 7,
          label: '系统操作'
        }],
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
          para.startTime = para.startTime.getTime()
        }
        if (para.endTime) {
          para.endTime = para.endTime.getTime()
        }
        customerAssetChangeLog(para).then(result => {
          this.list = result.data
          this.listLoading = false
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
