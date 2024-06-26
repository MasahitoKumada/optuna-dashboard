import assert from "node:assert"
import { openAsBlob } from "node:fs"
import path from "node:path"
import { describe, it } from "node:test"

import * as mut from "../pkg/journal.js"

describe("Test Journal File Storage", async () => {
  const blob = await openAsBlob(
    path.resolve(".", "test", "asset", "journal.log")
  )
  const buf = await blob.arrayBuffer()
  const storage = new mut.JournalFileStorage(buf)
  const studySummaries = await storage.getStudies()
  const studies = await Promise.all(
    studySummaries.map((_summary, index) => storage.getStudy(index))
  )

  it("Check the study with dynamic search space", () => {
    const study = studies.find((s) => s.name === "single-objective-dynamic")
    assert.deepStrictEqual(
      study.union_search_space.map((item) => item.name).sort(),
      ["x", "x", "category"].sort()
    )
    assert.strictEqual(
      study.union_search_space.some(
        (item) =>
          item.name === "category" &&
          item.distribution.type === "CategoricalDistribution" &&
          item.distribution.choices.length === 2
      ),
      true
    )
    assert.strictEqual(
      study.union_search_space.some(
        (item) =>
          item.name === "x" &&
          item.distribution.type === "FloatDistribution" &&
          item.distribution.low === 0 &&
          item.distribution.high === 10 &&
          item.distribution.step === null &&
          item.distribution.log === false
      ),
      true
    )
    assert.strictEqual(
      study.union_search_space.some(
        (item) =>
          item.name === "x" &&
          item.distribution.type === "FloatDistribution" &&
          item.distribution.low === -10 &&
          item.distribution.high === 0 &&
          item.distribution.step === null &&
          item.distribution.log === false
      ),
      true
    )
    assert.deepStrictEqual(
      study.intersection_search_space.map((item) => item.name).sort(),
      ["category"].sort()
    )
    assert.strictEqual(
      study.intersection_search_space.some(
        (item) =>
          item.name === "category" &&
          item.distribution.type === "CategoricalDistribution" &&
          item.distribution.choices.length === 2
      ),
      true
    )
  })

  it("Check the study including Infinities", () => {
    const study = studies.find((s) => s.name === "single-inf")
    study.trials.forEach((trial, index) => {
      if (index % 3 === 0) {
        assert.strictEqual(trial.values[0], Infinity)
      } else if (index % 3 === 1) {
        assert.strictEqual(trial.values[0], -Infinity)
      }
    })
  })

  it("Check the study including NaNs", () => {
    const study = studies.find((s) => s.name === "single-nan-report")
    for (const trial of study.trials) {
      assert.strictEqual(
        trial.intermediate_values.find((v) => v.step === 1).value,
        NaN
      )
    }
  })

  it("Check the parsing errors", async () => {
    const blob = await openAsBlob(
      path.resolve(".", "test", "asset", "journal-broken.log")
    )
    const buf = await blob.arrayBuffer()
    const storage = new mut.JournalFileStorage(buf)
    const errors = storage.getErrors()

    assert.strictEqual(errors.length, 1)
    assert.strictEqual(
      errors[0].message,
      `Unexpected token '.', ..."op_code": ..., "work"... is not valid JSON`
    )
  })

  it("Check metric_names function", () => {
    const study = studies.find((s) => s.name === "multi-objective-metric-names")
    assert.deepStrictEqual(study.metric_names, ["value1", "value2"])
  })

  it("Check the study with constraints", () => {
    const study = studies.find((s) => s.name === "multi-objective-constraints")
    for (const trial of study.trials) {
      assert.strictEqual(trial.constraints.length, 2)
    }
  })

  it("Check the number of studies", () => {
    const N_STUDIES = 6
    assert.strictEqual(studies.length, N_STUDIES)
  })
})
