#!/usr/bin/env python3
"""
CLI tool to check user conversions from database.

Usage:
    python check_user_conversions.py <user_id> [limit]
    python check_user_conversions.py all [limit]
    python check_user_conversions.py stats <user_id>
"""

import sys
from collections import defaultdict
from sqlalchemy.orm import Session

from db.models import Conversion, User
from db.session import SessionLocal


def list_user_conversions(user_id: int, limit: int = 50):
    """List conversions for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        conversions = (
            db.query(Conversion)
            .filter(Conversion.owner_user_id == user_id)
            .order_by(Conversion.created_at.desc())
            .limit(limit)
            .all()
        )
        
        print(f"\n{'='*100}")
        print(f"Conversions for {user.email} (ID: {user_id})")
        print(f"{'='*100}")
        print(f"{'ID':<6} {'Action':<18} {'File':<30} {'Status':<10} {'Points':<7} {'Date':<20}")
        print(f"{'-'*100}")
        
        for conv in conversions:
            status_icon = "✓" if conv.status == "success" else "✗" if conv.status == "failed" else "⏳"
            status = f"{status_icon} {conv.status}"
            date_str = conv.created_at.strftime("%Y-%m-%d %H:%M:%S")
            filename = conv.input_filename[:29]
            
            print(f"{conv.id:<6} {conv.action:<18} {filename:<30} {status:<10} {conv.points_charged:<7} {date_str:<20}")
            
            if conv.error_message:
                print(f"       Error: {conv.error_message[:80]}")
        
        print(f"{'='*100}")
        print(f"Total: {len(conversions)} conversions\n")
        
        # Statistics
        total = len(conversions)
        if total > 0:
            successful = sum(1 for c in conversions if c.status == "success")
            failed = sum(1 for c in conversions if c.status == "failed")
            processing = sum(1 for c in conversions if c.status == "processing")
            total_points = sum(c.points_charged for c in conversions)
            
            print(f"Statistics:")
            print(f"  Successful: {successful}/{total} ({successful*100//total if total else 0}%)")
            print(f"  Failed: {failed}/{total} ({failed*100//total if total else 0}%)")
            print(f"  Processing: {processing}/{total}")
            print(f"  Total Points Charged: {total_points}")
            print()
        
    finally:
        db.close()


def list_all_conversions(limit: int = 50):
    """List all conversions across all users."""
    db = SessionLocal()
    try:
        conversions = (
            db.query(Conversion)
            .order_by(Conversion.created_at.desc())
            .limit(limit)
            .all()
        )
        
        print(f"\n{'='*110}")
        print(f"All Conversions (Latest {limit})")
        print(f"{'='*110}")
        print(f"{'ID':<6} {'User':<6} {'Action':<18} {'File':<25} {'Status':<10} {'Points':<7} {'Date':<20}")
        print(f"{'-'*110}")
        
        for conv in conversions:
            status_icon = "✓" if conv.status == "success" else "✗" if conv.status == "failed" else "⏳"
            status = f"{status_icon} {conv.status}"
            date_str = conv.created_at.strftime("%Y-%m-%d %H:%M:%S")
            filename = conv.input_filename[:24]
            
            print(f"{conv.id:<6} {conv.owner_user_id:<6} {conv.action:<18} {filename:<25} {status:<10} {conv.points_charged:<7} {date_str:<20}")
        
        print(f"{'='*110}\n")
        
    finally:
        db.close()


def show_user_stats(user_id: int):
    """Show detailed statistics for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return
        
        conversions = (
            db.query(Conversion)
            .filter(Conversion.owner_user_id == user_id)
            .all()
        )
        
        if not conversions:
            print(f"\n{user.email} has no conversions yet.\n")
            return
        
        # Calculate statistics
        total = len(conversions)
        successful = sum(1 for c in conversions if c.status == "success")
        failed = sum(1 for c in conversions if c.status == "failed")
        processing = sum(1 for c in conversions if c.status == "processing")
        total_points = sum(c.points_charged for c in conversions)
        
        # By action
        by_action = defaultdict(lambda: {"total": 0, "success": 0, "failed": 0, "points": 0})
        for conv in conversions:
            by_action[conv.action]["total"] += 1
            if conv.status == "success":
                by_action[conv.action]["success"] += 1
            elif conv.status == "failed":
                by_action[conv.action]["failed"] += 1
            by_action[conv.action]["points"] += conv.points_charged
        
        print(f"\n{'='*80}")
        print(f"Conversion Statistics for {user.email} (ID: {user_id})")
        print(f"{'='*80}")
        print(f"\nOverall:")
        print(f"  Total Conversions: {total}")
        print(f"  Successful: {successful} ({successful*100//total if total else 0}%)")
        print(f"  Failed: {failed} ({failed*100//total if total else 0}%)")
        print(f"  Processing: {processing}")
        print(f"  Total Points Charged: {total_points}")
        
        print(f"\nBy Action:")
        print(f"  {'Action':<20} {'Total':<8} {'Success':<10} {'Failed':<8} {'Points':<8}")
        print(f"  {'-'*60}")
        for action, stats in sorted(by_action.items()):
            print(f"  {action:<20} {stats['total']:<8} {stats['success']:<10} {stats['failed']:<8} {stats['points']:<8}")
        
        # Recent activity
        recent = sorted(conversions, key=lambda c: c.created_at, reverse=True)[:5]
        print(f"\nRecent Activity (Last 5):")
        print(f"  {'Date':<20} {'Action':<18} {'Status':<10}")
        print(f"  {'-'*50}")
        for conv in recent:
            date_str = conv.created_at.strftime("%Y-%m-%d %H:%M:%S")
            status_icon = "✓" if conv.status == "success" else "✗" if conv.status == "failed" else "⏳"
            status = f"{status_icon} {conv.status}"
            print(f"  {date_str:<20} {conv.action:<18} {status:<10}")
        
        print(f"{'='*80}\n")
        
    finally:
        db.close()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "all":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        list_all_conversions(limit)
    elif command == "stats":
        if len(sys.argv) < 3:
            print("Usage: python check_user_conversions.py stats <user_id>")
            sys.exit(1)
        user_id = int(sys.argv[2])
        show_user_stats(user_id)
    else:
        user_id = int(sys.argv[1])
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        list_user_conversions(user_id, limit)


if __name__ == "__main__":
    main()
