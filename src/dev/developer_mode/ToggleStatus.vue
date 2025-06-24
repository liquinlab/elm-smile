<script setup>
import { Switch } from '@/uikit/components/ui/switch'
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
      </tbody>
    </table>
  </div>
</template>
