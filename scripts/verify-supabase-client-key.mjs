function jwtRole(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    return payload.role
  } catch {
    return undefined
  }
}

export function verifySupabaseClientKey(bundle, buildName) {
  const publishableKeys = bundle.match(/sb_publishable_[A-Za-z0-9_-]+/g) ?? []
  const jwtCandidates = bundle.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? []
  const anonKeys = jwtCandidates.filter((token) => jwtRole(token) === 'anon')
  const serviceRoleKeys = jwtCandidates.filter((token) => jwtRole(token) === 'service_role')

  if (bundle.includes('sb_secret_') || bundle.includes('service_role') || serviceRoleKeys.length > 0) {
    throw new Error(`Geheime Supabase-sleutel aangetroffen in ${buildName}`)
  }

  if (publishableKeys.length + anonKeys.length !== 1) {
    throw new Error(`${buildName} moet precies één openbare Supabase client-sleutel bevatten`)
  }
}
