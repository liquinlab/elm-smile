<script setup>
import { Switch } from '@/uikit/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import useSmileStore from '@/core/stores/smilestore'

const smilestore = useSmileStore()
</script>

<template>
  <!-- content of panel here -->
  <div class="bg-muted">
    <table class="w-full">
      <tbody>
        <tr class="table-row-base">
          <td class="table-cell-base table-cell-left table-cell-small font-mono">
            Consent<br />
            <div class="field">
              <Switch v-model="smilestore.browserPersisted.consented" class="mt-1" />
            </div>
          </td>
          <td class="table-cell-base table-cell-left table-cell-small font-mono">
            Known<br />
            <div class="field">
              <Switch v-model="smilestore.browserPersisted.knownUser" class="mt-1" />
            </div>
          </td>
          <td class="table-cell-base table-cell-left table-cell-small font-mono">
            Done<br />
            <div class="field">
              <Switch v-model="smilestore.browserPersisted.done" class="mt-1" />
            </div>
          </td>
          <td class="table-cell-base table-cell-left table-cell-small font-mono">
            Withdrew<br />
            <div class="field">
              <Switch v-model="smilestore.browserPersisted.withdrawn" class="mt-1" />
            </div>
          </td>
        </tr>
        <tr class="table-row-base table-row-base-bottom">
          <td class="table-cell-base table-cell-left table-cell-small font-mono">
            Dark Mode<br />
            <div class="field">
              <Switch class="mt-1" />
            </div>
          </td>
          <td class="table-cell-base table-cell-left table-cell-mono table-cell-small" colspan="3">
            <div class="field">
              <Select v-model="smilestore.data.recruitmentService" class="mt-1 h-8">
                <SelectTrigger size="sm" class="h-8 text-[1.2em] font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(cond, key) in smilestore.browserEphemeral.urls" :key="cond" :value="key">
                    {{ key }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-cell-small {
  font-size: 0.6em;
}

/* Ensure consistent spacing between table cells */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

td {
  border: none;
  padding: 0.5rem 0.85rem;
}
</style>
