;; Music Royalty Distribution Smart Contract
;; This contract manages music royalty distributions among artists, producers, and rights holders

;; Error codes
(define-constant ERR-UNAUTHORIZED-ACCESS (err u100))
(define-constant ERR-INVALID-ROYALTY-PERCENTAGE (err u101))
(define-constant ERR-DUPLICATE-SONG-ENTRY (err u102))
(define-constant ERR-SONG-DOES-NOT-EXIST (err u103))
(define-constant ERR-INSUFFICIENT-PAYMENT-FUNDS (err u104))
(define-constant ERR-INVALID-ROYALTY-RECIPIENT (err u105))
(define-constant ERR-PAYMENT-FAILED (err u106))
(define-constant ERR-INVALID-STRING-LENGTH (err u107))
(define-constant ERR-INVALID-SONG-TITLE (err u108))
(define-constant ERR-INVALID-PARTICIPANT-ROLE (err u109))
(define-constant ERR-INVALID-PRIMARY-ARTIST (err u110))
(define-constant ERR-INVALID-ADMINISTRATOR (err u111))

;; Data structures
(define-map RegisteredSongs
  { song-identifier: uint }
  {
    song-title: (string-ascii 50),
    primary-artist: principal,
    accumulated-revenue: uint,
    publication-date: uint,
    song-status-active: bool,
  }
)

(define-map RoyaltyDistribution
  {
    song-identifier: uint,
    royalty-recipient: principal,
  }
  {
    royalty-percentage: uint,
    participant-role: (string-ascii 20),
    accumulated-earnings: uint,
  }
)