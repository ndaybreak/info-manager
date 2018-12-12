<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.type" @change="handleFilter" placeholder="请选择费率类型">
        <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.coinId" @change="handleFilter" placeholder="请选择数字币">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <!--<el-select clearable style="width: 150px" disabled class="filter-item" v-model="query.template" @change="getList" placeholder="请选择费率模板">-->
        <!--<el-option v-for="item in coinFeeTemplateList" :key="item.id" :label="item.name" :value="item.id">-->
        <!--</el-option>-->
      <!--</el-select>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入备注信息" v-model="query.info"></el-input>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
      <el-button v-if="isEdit" class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="费率模板名称" width="200" prop="template_name"></el-table-column>
      <el-table-column align="center" label="费率类型" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.type | typeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="币种" width="90" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="手续费" width="100" prop="fee_rate">
        <template slot-scope="scope">
          <span>{{scope.row.fee_rate}} {{scope.row.coin_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="最小数量" width="120" prop="min_quantity"></el-table-column>
      <el-table-column align="center" label="最大数量" width="120" prop="max_quantity"></el-table-column>
      <el-table-column align="center" label="备注" width="200" prop="info"></el-table-column>
      <el-table-column align="center" label="创建人" width="100" prop="creator_name"></el-table-column>
      <el-table-column align="center" label="创建时间" width="160" prop="create_time">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改时间" width="160" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" v-if="isEdit" align="center" :label="$t('table.actions')" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.delete')}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :inline="true" ref="dataForm" :model="tempInfo" label-position="left" label-width="170px" style='width: 900px; margin-left:50px;'>
        <el-form-item label="费率类型" prop="type">
          <el-select clearable class="filter-item" v-model="tempInfo.type" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数字币" prop="coin_id" class="item-right">
          <el-select clearable class="filter-item" v-model="tempInfo.coin_id" placeholder="请选择">
            <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手续费" prop="fee_rate">
          <el-input-number v-model="tempInfo.fee_rate" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="费率模板" prop="template" class="item-right">
          <el-select clearable class="filter-item" v-model="tempInfo.template" placeholder="请选择">
            <el-option v-for="item in coinFeeTemplateList" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最小数量" prop="min_quantity">
          <el-input-number v-model="tempInfo.min_quantity" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="最大数量" prop="max_quantity" class="item-right">
          <el-input-number v-model="tempInfo.max_quantity" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="info">
          <el-input type="textarea" style="width: 643px;" :rows="3" v-model="tempInfo.info"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else-if="dialogStatus=='update'" type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { coinTempateDetailFetchAll, coinTempateDetailCreate, coinTempateDetailUpdate, coinTempateDetailDelete, coinFeeTemplateDropdown, getCoinList } from '@/api/customer'
  import waves from '@/directive/waves' // 水波纹指令

  export default {
    name: 'coinTemplate',
    components: {
    },
    directives: {
      waves
    },
    filters: {
      typeFilter(type) {
        const typeMap = {
          1: '充值',
          2: '提现'
        }
        return typeMap[type]
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
          pageSize: 15
        },
        tempInfo: {
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加',
          copy: '复制'
        },
        rules: {
          type: [{ required: true, message: '请填写', trigger: 'blur' }],
          coin_id: [{ required: true, message: '请填写', trigger: 'blur' }],
          fee_rate: [{ required: true, message: '请填写', trigger: 'blur' }],
          template: [{ required: true, message: '请填写', trigger: 'blur' }],
          min_quantity: [{ required: true, message: '请填写', trigger: 'blur' }],
          max_quantity: [{ required: true, message: '请填写', trigger: 'blur' }],
          info: [{ required: false, message: '请填写', trigger: 'blur' }]
        },
        typeList: [{
          id: 1,
          name: '充值'
        }, {
          id: 2,
          name: '提现'
        }],
        updatingObj: '',
        coinFeeTemplateList: [],
        coinList: [],
        isEdit: false
      }
    },
    created() {
      this.query.template = parseInt(this.$route.query.templateId)
      this.isEdit = this.$route.query.isEdit
      this.getStaticData()
      this.getList()
    },
    methods: {
      getStaticData() {
        coinFeeTemplateDropdown().then(result => {
          this.coinFeeTemplateList = result.data
        })
        getCoinList().then(result => {
          this.coinList = result.data
        })
      },
      getList() {
        this.listLoading = true
        coinTempateDetailFetchAll(this.query).then(result => {
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
      handleDelete(row) {
        this.$confirm('确认删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          coinTempateDetailDelete(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      resetTemp() {
        this.tempInfo = {
          type: '',
          coin_id: '',
          fee_rate: '',
          template: this.query.template,
          min_quantity: '',
          max_quantity: '',
          info: ''
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            coinTempateDetailCreate(this.tempInfo).then(data => {
              this.query.currPage = 1
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleUpdate(row) {
        this.updatingObj = row
        this.tempInfo = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            coinTempateDetailUpdate(this.tempInfo, this.updatingObj).then((res) => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      }
    }
  }
</script>
<style scoped>
  .item-right {
    margin-left: 60px;
  }
</style>
