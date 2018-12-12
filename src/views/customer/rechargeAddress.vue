<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.accountId"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.account"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.coinId" @change="handleFilter" placeholder="请选择币种">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入充值地址ID" v-model="query.id"></el-input>
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入充值地址" v-model="query.address"></el-input>
      <el-select clearable style="width: 170px" class="filter-item" v-model="query.isDeleted" @change="handleFilter" placeholder="请选择充值地址状态">
        <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-date-picker v-model="query.startTime" class="filter-item" style="width: 170px" type="datetime" placeholder="请输入起始时间"></el-date-picker>
      <el-date-picker v-model="query.endTime" class="filter-item" style="width: 170px" type="datetime" placeholder="请输入结束时间"></el-date-picker>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <!--<el-table-column align="center" label="UID" width="80" prop="account_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="120" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="50" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="110" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="数字币" width="80" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="充值地址ID" width="120" prop="id"></el-table-column>
      <el-table-column align="center" label="充值地址" width="120" prop="address"></el-table-column>
      <el-table-column align="center" label="充值地址状态" width="150" prop="balance">
        <template slot-scope="scope">
          <span>{{scope.row.is_deleted | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="公钥地址" width="200" prop="public_key"></el-table-column>
      <el-table-column align="center" label="私钥地址" width="200" prop="private_key"></el-table-column>
      <el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改日期" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="$t('table.actions')" width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.is_deleted" size="mini" type="success" @click="handleRecover(scope.row)">恢复</el-button>
          <el-button v-else size="mini" type="danger" @click="handleDelete(scope.row)">停用</el-button>
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
  import { rechargeAddressFetchAll, rechargeAddressDelete, rechargeAddressRecover } from '@/api/customer'
  import waves from '@/directive/waves' // 水波纹指令
  import { getCoinList } from '@/api/customer'
  import { parseTime } from '@/utils'

  export default {
    name: 'deposit',
    directives: {
      waves
    },
    filters: {
      statusFilter(isDeleted) {
        return isDeleted ? '停用' : '正常'
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15,
          accountId: ''
        },
        tempInfo: {
        },
        tempCoinCode: '',
        dialogFormVisible: false,
        detailDialogVisible: false,
        dialogStatus: '',
        statusList: [{
          id: false,
          name: '正常'
        }, {
          id: true,
          name: '停用'
        }],
        updatingObj: '',
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
        rechargeAddressFetchAll(para).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
          if (this.list.length === 0 && this.query.currPage !== 1) {
            this.getList()
          }
        })
      },
      handleSizeChange(val) {
        this.query.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.query.currPage = val
        this.getList()
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleRecover(row) {
        this.$confirm('确认恢复?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          rechargeAddressRecover(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '恢复成功!'
            })
            this.getList()
          })
        })
      },
      handleDelete(row) {
        this.$confirm('确认停用?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          rechargeAddressDelete(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      }
    }
  }
</script>
