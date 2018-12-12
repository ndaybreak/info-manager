<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.accountNumber"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.coinId" @change="handleFilter" placeholder="请选择数字币">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.startTime" class="filter-item" type="datetime" placeholder="请输入起始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="日期" width="200">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱" width="200" prop="email"></el-table-column>
      <el-table-column align="center" label="电话" width="180" prop="mobileNumber"></el-table-column>
      <el-table-column align="center" label="币种" width="100" prop="coinCode"></el-table-column>
      <el-table-column align="center" label="变动金额" width="150" prop="commissionAmount"></el-table-column>
      <el-table-column align="center" label="分佣比例" width="150" prop="commissionRate"></el-table-column>
      <el-table-column align="center" label="分佣总额" width="150" prop="commissionTotalAmount"></el-table-column>
      <!--<el-table-column align="center" label="操作人" width="150" prop="modifier_name"></el-table-column>-->
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import { agentCommissionFetchAll } from '@/api/query'
  import { getCoinList } from '@/api/customer'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'merchantDepositLog',
    directives: {
      waves
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: '缴纳',
          2: '退还',
          3: '扣罚'
        }
        return statusMap[status]
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
        statusList: [{
          id: 1,
          label: '缴纳'
        }, {
          id: 2,
          label: '退还'
        }, {
          id: 3,
          label: '扣罚'
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
          para.startTime = para.startTime.getTime() / 1000
        }
        if (para.endTime) {
          para.endTime = para.endTime.getTime() / 1000
        }
        agentCommissionFetchAll(para).then(response => {
          this.list = response.data
          this.listLoading = false
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
