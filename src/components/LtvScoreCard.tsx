import React, { useMemo, useState } from 'react';
import { Trophy, Crown, Award, Users, ArrowUpRight, Repeat, DollarSign } from 'lucide-react';
import { Artist, Deal } from '../types';

interface LtvScoreCardProps {
  isLight: boolean;
  artists: Artist[];
  deals: Deal[];
  formatMoney: (val: number) => string;
  t: any;
}

export const LtvScoreCard: React.FC<LtvScoreCardProps> = ({
  isLight,
  artists,
  deals,
  formatMoney,
  t,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Group closed deals by artist
  const ltvData = useMemo(() => {
    const map = new Map<
      string,
      {
        artistId: string;
        artistName: string;
        totalLtv: number;
        closedDealsCount: number;
        avatarInitial: string;
      }
    >();

    // Index existing artists by ID and lower-cased name
    const artistById = new Map<string, Artist>();
    const artistByName = new Map<string, Artist>();
    artists.forEach((a) => {
      artistById.set(a.id, a);
      if (a.name) {
        artistByName.set(a.name.toLowerCase().trim(), a);
      }
    });

    // Populate closed deals
    deals.forEach((d) => {
      if (d.stage === 'closed') {
        const amount = Number(d.amount) || 0;
        let matchedArtist = d.artistId ? artistById.get(d.artistId) : undefined;

        if (!matchedArtist && d.artistName) {
          matchedArtist = artistByName.get(d.artistName.toLowerCase().trim());
        }

        const id = matchedArtist ? matchedArtist.id : (d.artistId || `deal_name_${d.artistName?.toLowerCase().trim() || 'unknown'}`);
        const name = matchedArtist ? matchedArtist.name : (d.artistName || 'Неизвестный артист');

        if (!map.has(id)) {
          map.set(id, {
            artistId: id,
            artistName: name,
            totalLtv: 0,
            closedDealsCount: 0,
            avatarInitial: name.charAt(0).toUpperCase() || '?',
          });
        }

        const item = map.get(id)!;
        item.totalLtv += amount;
        item.closedDealsCount += 1;
      }
    });

    const ranking = Array.from(map.values())
      .filter((item) => item.closedDealsCount > 0)
      .sort((a, b) => b.totalLtv - a.totalLtv)
      .map((item) => {
        let tier: 'vip' | 'regular' | 'one_time' = 'one_time';
        let tierLabel = t.oneTimeClient || 'Разовый';
        if (item.totalLtv >= 1000 || item.closedDealsCount >= 3) {
          tier = 'vip';
          tierLabel = t.vipClient || 'VIP Клиент';
        } else if (item.closedDealsCount >= 2) {
          tier = 'regular';
          tierLabel = t.regularClient || 'Постоянный';
        }
        return {
          ...item,
          avgCheck: Math.round(item.totalLtv / item.closedDealsCount),
          tier,
          tierLabel,
        };
      });

    const totalRevenue = ranking.reduce((acc, curr) => acc + curr.totalLtv, 0);
    const avgLtv = ranking.length > 0 ? Math.round(totalRevenue / ranking.length) : 0;
    const repeatClients = ranking.filter((item) => item.closedDealsCount >= 2);
    const repeatRate =
      ranking.length > 0 ? Math.round((repeatClients.length / ranking.length) * 100) : 0;

    return {
      ranking,
      topClients: ranking.slice(0, showAll ? 10 : 5),
      avgLtv,
      repeatRate,
      payingClientsCount: ranking.length,
      repeatClientsCount: repeatClients.length,
      totalRevenue,
    };
  }, [artists, deals, t, showAll]);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between relative transition-all duration-200 ${
        isLight
          ? 'bg-[#F8F9FA] border-black/[0.06] shadow-xs'
          : 'bg-[#151519] border-white/[0.04]'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4
                className={`text-sm font-semibold tracking-tight ${
                  isLight ? 'text-[#1A1A1E]' : 'text-white'
                }`}
              >
                {t.ltvTitle || 'LTV Score (Индекс возвращаемости)'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {t.topClientsByLtv || 'Топ клиентов по доходности'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                isLight
                  ? 'bg-white border-black/[0.06]'
                  : 'bg-[#18181C] border-white/[0.06]'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-zinc-400">{t.avgLtv || 'Ср. LTV'}:</span>
              <span className="font-mono font-bold">{formatMoney(ltvData.avgLtv)}</span>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                isLight
                  ? 'bg-white border-black/[0.06]'
                  : 'bg-[#18181C] border-white/[0.06]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] text-zinc-400">{t.repeatClientsRate || 'Повторные'}:</span>
              <span className="font-mono font-bold text-indigo-500">{ltvData.repeatRate}%</span>
            </div>
          </div>
        </div>

        {/* Top Clients List */}
        {ltvData.ranking.length === 0 ? (
          <div
            className={`py-8 text-center rounded-xl border border-dashed ${
              isLight ? 'border-zinc-200 text-zinc-400' : 'border-white/[0.08] text-zinc-500'
            }`}
          >
            <Users className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
            <p className="text-xs">{t.noLtvData || 'Пока нет закрытых сделок по клиентам'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ltvData.topClients.map((client, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={client.artistId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isFirst
                      ? isLight
                        ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                        : 'bg-amber-500/[0.06] border-amber-500/20'
                      : isLight
                      ? 'bg-white border-black/[0.04] hover:bg-black/[0.01]'
                      : 'bg-[#18181C] border-white/[0.04] hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isFirst
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs'
                          : isSecond
                          ? isLight
                            ? 'bg-zinc-200 text-zinc-700'
                            : 'bg-zinc-700 text-zinc-200'
                          : isThird
                          ? isLight
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-amber-900/40 text-amber-300'
                          : isLight
                          ? 'bg-zinc-100 text-zinc-500'
                          : 'bg-white/[0.06] text-zinc-400'
                      }`}
                    >
                      {isFirst ? <Crown className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    {/* Avatar Initials */}
                    <div
                      className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                        isLight
                          ? 'bg-zinc-100 text-zinc-700 border border-black/[0.06]'
                          : 'bg-white/[0.06] text-zinc-200 border border-white/[0.06]'
                      }`}
                    >
                      {client.avatarInitial}
                    </div>

                    {/* Artist Name & Deals Count */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isLight ? 'text-[#1A1A1E]' : 'text-white'
                          }`}
                        >
                          {client.artistName}
                        </span>
                        {client.tier === 'vip' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            VIP
                          </span>
                        )}
                        {client.tier === 'regular' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {t.regularClient || 'Постоянный'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                        <span className="font-mono">{client.closedDealsCount} {t.closedDeals || 'сделок'}</span>
                        <span>•</span>
                        <span>Ср. чек: {formatMoney(client.avgCheck)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total LTV Amount */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isFirst
                          ? 'text-amber-600 dark:text-amber-400'
                          : isLight
                          ? 'text-emerald-700'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(client.totalLtv)}
                    </div>
                    <div className="text-[9px] text-zinc-400">
                      {ltvData.totalRevenue > 0
                        ? `${Math.round((client.totalLtv / ltvData.totalRevenue) * 100)}% базы`
                        : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Expand Top 10 or Summary */}
      {ltvData.ranking.length > 5 && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-400">
            {t.allDealsCount || 'Всего клиентов с закрытыми сделками'}: {ltvData.payingClientsCount}
          </span>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className={`text-xs font-semibold transition cursor-pointer hover:underline ${
              isLight ? 'text-indigo-600' : 'text-indigo-400'
            }`}
          >
            {showAll ? 'Свернуть до Топ-5' : `Показать Топ-10 (${ltvData.ranking.length})`}
          </button>
        </div>
      )}
    </div>
  );
};
