<!--
  Compiled by vue-tsc in CI. Generating the declarations only proves a file was
  written; this proves a Vue consumer can actually use the tags, that the props
  are typed from the components and that a wrong value is rejected.
-->
<script setup lang="ts">
import { ref } from 'vue';

const periode = ref('2026-07-06/2026-07-20');
const onChange = (event: CustomEvent) => void event.detail;
</script>

<template>
	<nldd-button text="Opslaan" variant="primary" />

	<nldd-date-field
		:value="periode"
		range
		min="today"
		max="today+3m"
		size="sm"
		@change="onChange"
	/>

	<nldd-date-picker week-numbers :first-day-of-week="1" />

	<nldd-icon icon="calendar" />
</template>
