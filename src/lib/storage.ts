import { RunSummary, RunDetail } from "@/contracts/run";

const KEYS = {
  RUNS_LIST: "dpp_runs",
  RUN_PREFIX: "dpp_run_",
  DISCARD_KNOWLEDGE: "dpp_discard_knowledge",
} as const;

export const storage = {
  /**
   * Run 리스트 조회
   * @returns 최근 생성된 Run 순으로 정렬된 RunSummary 배열
   */
  getRunsList(): RunSummary[] {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(KEYS.RUNS_LIST);
    if (!stored) return [];

    try {
      const { runs } = JSON.parse(stored);
      // 최근 생성 순으로 정렬 (created_at 내림차순)
      return runs.sort(
        (a: RunSummary, b: RunSummary) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error("[Storage] Failed to parse runs list:", error);
      return [];
    }
  },

  /**
   * Run 리스트 업데이트
   * @param run 업데이트할 RunSummary
   * @description LRU 방식으로 최근 50개만 유지
   */
  updateRunsList(run: RunSummary): void {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return;

    const runs = this.getRunsList();
    const index = runs.findIndex((r) => r.run_id === run.run_id);

    if (index >= 0) {
      // 기존 Run 업데이트
      runs[index] = run;
    } else {
      // 새 Run 추가
      runs.push(run);
    }

    // LRU: 최근 50개만 유지
    const limited = runs
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 50);

    try {
      localStorage.setItem(
        KEYS.RUNS_LIST,
        JSON.stringify({
          runs: limited,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("[Storage] Failed to update runs list:", error);
    }
  },

  /**
   * Run 상세 저장
   * @param run 저장할 RunDetail
   * @description Run 상세 정보를 LocalStorage에 저장하고, 리스트도 자동 업데이트
   *
   * NOTE: Run.inputs는 WizardState 전체를 저장하지만,
   * **File 객체는 영속 저장하지 않습니다** (JSON 직렬화 불가).
   * 파일 메타 정보는 run.manifest.inputs.files[]로 확인 가능합니다.
   */
  saveRun(run: RunDetail): void {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return;

    try {
      // File 객체 제거한 저장용 객체 생성 (직렬화 안정성)
      const persistableRun: RunDetail = {
        ...run,
        inputs: {
          ...run.inputs,
          sources: {
            ...run.inputs.sources,
            files: [], // File 객체는 저장하지 않음
          },
        },
      };

      // Run 상세 저장
      localStorage.setItem(
        `${KEYS.RUN_PREFIX}${run.run_id}`,
        JSON.stringify(persistableRun)
      );

      // Run 리스트 동기화
      this.updateRunsList({
        run_id: run.run_id,
        sku: run.sku,
        profile_id: run.profile_id,
        status: run.status,
        created_at: run.created_at,
        run_name: run.run_name,
      });
    } catch (error) {
      console.error("[Storage] Failed to save run:", error);
    }
  },

  /**
   * Run 상세 조회
   * @param runId Run ID
   * @returns RunDetail 또는 null (존재하지 않는 경우)
   */
  getRun(runId: string): RunDetail | null {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(`${KEYS.RUN_PREFIX}${runId}`);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("[Storage] Failed to parse run:", error);
      return null;
    }
  },

  /**
   * Run 삭제
   * @param runId Run ID
   * @description Run 상세와 리스트에서 모두 삭제
   */
  deleteRun(runId: string): void {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return;

    try {
      // Run 상세 삭제
      localStorage.removeItem(`${KEYS.RUN_PREFIX}${runId}`);

      // Run 리스트에서 제거
      const runs = this.getRunsList();
      const filtered = runs.filter((r) => r.run_id !== runId);

      localStorage.setItem(
        KEYS.RUNS_LIST,
        JSON.stringify({
          runs: filtered,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("[Storage] Failed to delete run:", error);
    }
  },

  /**
   * Discard Knowledge 저장 (FAILED Run용)
   * @param runId Run ID
   * @param knowledge 저장할 지식 객체
   */
  saveDiscardKnowledge(
    runId: string,
    knowledge: Record<string, unknown>
  ): void {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(KEYS.DISCARD_KNOWLEDGE);
      const data = stored ? JSON.parse(stored) : {};

      data[runId] = {
        ...knowledge,
        saved_at: new Date().toISOString(),
      };

      localStorage.setItem(KEYS.DISCARD_KNOWLEDGE, JSON.stringify(data));
    } catch (error) {
      console.error("[Storage] Failed to save discard knowledge:", error);
    }
  },

  /**
   * Discard Knowledge 조회
   * @param runId Run ID
   * @returns 저장된 지식 객체 또는 null
   */
  getDiscardKnowledge(runId: string): Record<string, unknown> | null {
    // SSR 대응: window 객체 확인
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(KEYS.DISCARD_KNOWLEDGE);
      if (!stored) return null;

      const data = JSON.parse(stored);
      return data[runId] || null;
    } catch (error) {
      console.error("[Storage] Failed to get discard knowledge:", error);
      return null;
    }
  },
};
