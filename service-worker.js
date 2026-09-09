// 🧹 자기 삭제용 서비스워커
// 목적: 예전에 설치된(캐싱용) 서비스워커가 있는 브라우저에서, 이 파일이
// 새로 설치되는 순간 모든 캐시를 지우고 스스로 등록 해제되어, 그 이후로는
// 서비스워커 없이 완전히 정상적으로(항상 서버의 최신 파일을 받아서) 동작하게 만듭니다.
//
// 사용법: 이 파일을 index.html/index1.html/products.json과 같은 폴더(저장소 루트)에
// "service-worker.js" 라는 이름 그대로 업로드하세요.
//
// ⚠️ 모든 방문자의 브라우저가 정상화된 게 확인되면(대략 1~2주 후),
//    index.html 안의 "좀비 서비스워커 자동 청소 코드" 블록과 이 파일을
//    둘 다 삭제해도 됩니다 (그 이후엔 서비스워커 자체가 없는 평범한
//    정적 사이트로 계속 잘 동작합니다).

self.addEventListener('install', () => {
  // 대기 없이 바로 활성화 단계로 넘어감
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1) 이 오리진에 저장된 모든 캐시 삭제
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (e) {
        // 캐시 삭제 실패해도 계속 진행
      }

      // 2) 지금 열려있는 모든 탭을 새로고침해서 서버의 최신 파일을 바로 받게 함
      try {
        const clientsList = await self.clients.matchAll({ type: 'window' });
        clientsList.forEach((client) => {
          try { client.navigate(client.url); } catch (e) {}
        });
      } catch (e) {}

      // 3) 스스로 등록 해제 — 이후로는 서비스워커 없이 정상 동작
      try {
        await self.registration.unregister();
      } catch (e) {}
    })()
  );
});
