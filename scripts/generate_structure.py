#!/usr/bin/env python3
"""
Generate NeetCode 150 folder structure and placeholder HTML for each problem.
Run: python3 scripts/generate_structure.py
"""
import os

# Base output folder
# Use script location to reference the project root categories directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'categories'))

# Mapping of categories to problem list (slug, title)
CATEGORIES = {
    'arrays-hashing': {
        'name': 'Arrays & Hashing',
        'problems': [
            ('contains_duplicate.html', 'Contains Duplicate | LC 217'),
            ('valid_anagram.html', 'Valid Anagram | LC 242'),
            ('two_sum.html', 'Two Sum | LC 1'),
            ('group_anagrams.html', 'Group Anagrams | LC 49'),
            ('top_k_frequent_elements.html', 'Top K Frequent Elements | LC 347'),
            ('product_except_self.html', 'Product of Array Except Self | LC 238'),
            ('valid_sudoku.html', 'Valid Sudoku | LC 36'),
            ('encode_decode_strings.html', 'Encode and Decode Strings | LC 271 (Premium)'),
            ('longest_consecutive_sequence.html', 'Longest Consecutive Sequence | LC 128'),
        ]
    },
    'two-pointers': {
        'name': 'Two Pointers',
        'problems': [
            ('valid_palindrome.html', 'Valid Palindrome | LC 125'),
            ('two_sum_ii.html', 'Two Sum II - Input Array Is Sorted | LC 167'),
            ('three_sum.html', '3Sum | LC 15'),
            ('container_with_most_water.html', 'Container With Most Water | LC 11'),
            ('trapping_rain_water.html', 'Trapping Rain Water | LC 42'),
        ]
    },
    'sliding-window': {
        'name': 'Sliding Window',
        'problems': [
            ('best_time_buy_sell_stock.html', 'Best Time to Buy and Sell Stock | LC 121'),
            ('longest_substring_without_repeating_characters.html', 'Longest Substring Without Repeating Characters | LC 3'),
            ('longest_repeating_character_replacement.html', 'Longest Repeating Character Replacement | LC 424'),
            ('permutation_in_string.html', 'Permutation in String | LC 567'),
            ('minimum_window_substring.html', 'Minimum Window Substring | LC 76'),
            ('sliding_window_maximum.html', 'Sliding Window Maximum | LC 239'),
        ]
    },
    'stack': {
        'name': 'Stack & Monotonic Stack',
        'problems': [
            ('valid_parentheses.html', 'Valid Parentheses | LC 20'),
            ('min_stack.html', 'Min Stack | LC 155'),
            ('evaluate_reverse_polish_notation.html', 'Evaluate Reverse Polish Notation | LC 150'),
            ('generate_parentheses.html', 'Generate Parentheses | LC 22'),
            ('daily_temperatures.html', 'Daily Temperatures | LC 739'),
            ('car_fleet.html', 'Car Fleet | LC 853'),
            ('largest_rectangle_in_histogram.html', 'Largest Rectangle in Histogram | LC 84'),
        ]
    },
    'binary-search': {
        'name': 'Binary Search',
        'problems': [
            ('binary_search.html', 'Binary Search | LC 704'),
            ('search_2d_matrix.html', 'Search a 2D Matrix | LC 74'),
            ('koko_eating_bananas.html', 'Koko Eating Bananas | LC 875'),
            ('find_minimum_rotated_sorted_array.html', 'Find Minimum in Rotated Sorted Array | LC 153'),
            ('search_in_rotated_sorted_array.html', 'Search in Rotated Sorted Array | LC 33'),
            ('time_based_key_value_store.html', 'Time Based Key-Value Store | LC 981'),
            ('median_of_two_sorted_arrays.html', 'Median of Two Sorted Arrays | LC 4'),
        ]
    },
    'linked-list': {
        'name': 'Linked List',
        'problems': [
            ('reverse_linked_list.html', 'Reverse Linked List | LC 206'),
            ('merge_two_sorted_lists.html', 'Merge Two Sorted Lists | LC 21'),
            ('reorder_list.html', 'Reorder List | LC 143'),
            ('remove_nth_node_from_end.html', 'Remove Nth Node From End of List | LC 19'),
            ('copy_list_with_random_pointer.html', 'Copy List with Random Pointer | LC 138'),
            ('add_two_numbers.html', 'Add Two Numbers | LC 2'),
            ('linked_list_cycle.html', 'Linked List Cycle | LC 141'),
            ('find_duplicate_number.html', 'Find the Duplicate Number | LC 287'),
            ('lru_cache.html', 'LRU Cache | LC 146'),
            ('merge_k_sorted_lists.html', 'Merge k Sorted Lists | LC 23'),
            ('reverse_nodes_k_group.html', 'Reverse Nodes in k-Group | LC 25'),
        ]
    },
    'trees': {
        'name': 'Trees',
        'problems': [
            ('invert_binary_tree.html', 'Invert Binary Tree | LC 226'),
            ('maximum_depth_binary_tree.html', 'Maximum Depth of Binary Tree | LC 104'),
            ('diameter_binary_tree.html', 'Diameter of Binary Tree | LC 543'),
            ('balanced_binary_tree.html', 'Balanced Binary Tree | LC 110'),
            ('same_tree.html', 'Same Tree | LC 100'),
            ('subtree_of_another_tree.html', 'Subtree of Another Tree | LC 572'),
            ('lowest_common_ancestor_bst.html', 'Lowest Common Ancestor of a Binary Search Tree | LC 235'),
            ('binary_tree_level_order_traversal.html', 'Binary Tree Level Order Traversal | LC 102'),
            ('binary_tree_right_side_view.html', 'Binary Tree Right Side View | LC 199'),
            ('count_good_nodes.html', 'Count Good Nodes in Binary Tree | LC 1448'),
            ('validate_bst.html', 'Validate Binary Search Tree | LC 98'),
            ('kth_smallest_bst.html', 'Kth Smallest Element in a BST | LC 230'),
            ('construct_binary_tree_pre_inorder.html', 'Construct Binary Tree from Preorder and Inorder Traversal | LC 105'),
            ('binary_tree_maximum_path_sum.html', 'Binary Tree Maximum Path Sum | LC 124'),
            ('serialize_deserialize_binary_tree.html', 'Serialize and Deserialize Binary Tree | LC 297'),
        ]
    },
    'tries': {
        'name': 'Tries',
        'problems': [
            ('implement_trie.html', 'Implement Trie (Prefix Tree) | LC 208'),
            ('design_add_search.html', 'Design Add and Search Words Data Structure | LC 211'),
            ('word_search_ii.html', 'Word Search II | LC 212'),
        ]
    },
    'heap': {
        'name': 'Heap / Priority Queue',
        'problems': [
            ('kth_largest_stream.html', 'Kth Largest Element in a Stream | LC 703'),
            ('last_stone_weight.html', 'Last Stone Weight | LC 1046'),
            ('k_closest_points.html', 'K Closest Points to Origin | LC 973'),
            ('kth_largest_array.html', 'Kth Largest Element in an Array | LC 215'),
            ('task_scheduler.html', 'Task Scheduler | LC 621'),
            ('design_twitter.html', 'Design Twitter | LC 355'),
            ('find_median_data_stream.html', 'Find Median from Data Stream | LC 295'),
        ]
    },
    'backtracking': {
        'name': 'Backtracking',
        'problems': [
            ('subsets.html', 'Subsets | LC 78'),
            ('combination_sum.html', 'Combination Sum | LC 39'),
            ('permutations.html', 'Permutations | LC 46'),
            ('subsets_ii.html', 'Subsets II | LC 90'),
            ('combination_sum_ii.html', 'Combination Sum II | LC 40'),
            ('word_search.html', 'Word Search | LC 79'),
            ('palindrome_partitioning.html', 'Palindrome Partitioning | LC 131'),
            ('letter_combinations_phone_number.html', 'Letter Combinations of a Phone Number | LC 17'),
            ('n_queens.html', 'N-Queens | LC 51'),
        ]
    },
    'graphs': {
        'name': 'Graphs',
        'problems': [
            ('number_of_islands.html', 'Number of Islands | LC 200'),
            ('clone_graph.html', 'Clone Graph | LC 133'),
            ('max_area_of_island.html', 'Max Area of Island | LC 695'),
            ('pacific_atlantic_water_flow.html', 'Pacific Atlantic Water Flow | LC 417'),
            ('surrounded_regions.html', 'Surrounded Regions | LC 130'),
            ('rotting_oranges.html', 'Rotting Oranges | LC 994'),
            ('walls_and_gates.html', 'Walls and Gates | LC 286 (Premium)'),
            ('course_schedule.html', 'Course Schedule | LC 207'),
            ('course_schedule_ii.html', 'Course Schedule II | LC 210'),
            ('redundant_connection.html', 'Redundant Connection | LC 684'),
            ('num_connected_components.html', 'Number of Connected Components in an Undirected Graph | LC 323 (Premium)'),
            ('graph_valid_tree.html', 'Graph Valid Tree | LC 261 (Premium)'),
            ('word_ladder.html', 'Word Ladder | LC 127'),
        ]
    },
    'advanced-graphs': {
        'name': 'Advanced Graphs',
        'problems': [
            ('reconstruct_itinerary.html', 'Reconstruct Itinerary | LC 332'),
            ('min_cost_connect_points.html', 'Min Cost to Connect All Points | LC 1584'),
            ('network_delay_time.html', 'Network Delay Time | LC 743'),
            ('swim_in_rising_water.html', 'Swim in Rising Water | LC 778'),
            ('alien_dictionary.html', 'Alien Dictionary | LC 269 (Premium)'),
            ('cheapest_flights_k_stops.html', 'Cheapest Flights Within K Stops | LC 787'),
        ]
    },
    'dp-1d': {
        'name': '1-D Dynamic Programming',
        'problems': [
            ('climbing_stairs.html', 'Climbing Stairs | LC 70'),
            ('min_cost_climbing_stairs.html', 'Min Cost Climbing Stairs | LC 746'),
            ('house_robber.html', 'House Robber | LC 198'),
            ('house_robber_ii.html', 'House Robber II | LC 213'),
            ('longest_palindromic_substring.html', 'Longest Palindromic Substring | LC 5'),
            ('palindromic_substrings.html', 'Palindromic Substrings | LC 647'),
            ('decode_ways.html', 'Decode Ways | LC 91'),
            ('coin_change.html', 'Coin Change | LC 322'),
            ('maximum_product_subarray.html', 'Maximum Product Subarray | LC 152'),
            ('word_break.html', 'Word Break | LC 139'),
            ('longest_increasing_subsequence.html', 'Longest Increasing Subsequence | LC 300'),
            ('partition_equal_subset_sum.html', 'Partition Equal Subset Sum | LC 416'),
        ]
    },
    'dp-2d': {
        'name': '2-D Dynamic Programming',
        'problems': [
            ('unique_paths.html', 'Unique Paths | LC 62'),
            ('longest_common_subsequence.html', 'Longest Common Subsequence | LC 1143'),
            ('best_time_buy_sell_stock_cooldown.html', 'Best Time to Buy and Sell Stock with Cooldown | LC 309'),
            ('coin_change_2.html', 'Coin Change 2 | LC 518'),
            ('target_sum.html', 'Target Sum | LC 494'),
            ('interleaving_string.html', 'Interleaving String | LC 97'),
            ('longest_increasing_path_matrix.html', 'Longest Increasing Path in a Matrix | LC 329'),
            ('distinct_subsequences.html', 'Distinct Subsequences | LC 115'),
            ('edit_distance.html', 'Edit Distance | LC 72'),
            ('burst_balloons.html', 'Burst Balloons | LC 312'),
            ('regular_expression_matching.html', 'Regular Expression Matching | LC 10'),
        ]
    },
    'greedy': {
        'name': 'Greedy',
        'problems': [
            ('maximum_subarray.html', 'Maximum Subarray | LC 53'),
            ('jump_game.html', 'Jump Game | LC 55'),
            ('jump_game_ii.html', 'Jump Game II | LC 45'),
            ('gas_station.html', 'Gas Station | LC 134'),
            ('hand_of_straights.html', 'Hand of Straights | LC 846'),
            ('merge_triplets.html', 'Merge Triplets to Form Target Triplet | LC 1899'),
            ('partition_labels.html', 'Partition Labels | LC 763'),
            ('valid_parenthesis_string.html', 'Valid Parenthesis String | LC 678'),
        ]
    },
    'intervals': {
        'name': 'Intervals',
        'problems': [
            ('insert_interval.html', 'Insert Interval | LC 57'),
            ('merge_intervals.html', 'Merge Intervals | LC 56'),
            ('non_overlapping_intervals.html', 'Non-overlapping Intervals | LC 435'),
            ('meeting_rooms.html', 'Meeting Rooms | LC 252 (Premium)'),
            ('meeting_rooms_ii.html', 'Meeting Rooms II | LC 253 (Premium)'),
            ('minimum_interval_queries.html', 'Minimum Interval to Include Each Query | LC 1851'),
        ]
    },
    'math-geometry': {
        'name': 'Math & Geometry',
        'problems': [
            ('rotate_image.html', 'Rotate Image | LC 48'),
            ('spiral_matrix.html', 'Spiral Matrix | LC 54'),
            ('set_matrix_zeroes.html', 'Set Matrix Zeroes | LC 73'),
            ('happy_number.html', 'Happy Number | LC 202'),
            ('plus_one.html', 'Plus One | LC 66'),
            ('pow_x_n.html', 'Pow(x, n) | LC 50'),
            ('multiply_strings.html', 'Multiply Strings | LC 43'),
            ('detect_squares.html', 'Detect Squares | LC 2013'),
        ]
    },
    'bit-manipulation': {
        'name': 'Bit Manipulation',
        'problems': [
            ('single_number.html', 'Single Number | LC 136'),
            ('number_of_1_bits.html', 'Number of 1 Bits | LC 191'),
            ('counting_bits.html', 'Counting Bits | LC 338'),
            ('reverse_bits.html', 'Reverse Bits | LC 190'),
            ('missing_number.html', 'Missing Number | LC 268'),
            ('sum_of_two_integers.html', 'Sum of Two Integers | LC 371'),
            ('reverse_integer.html', 'Reverse Integer | LC 7'),
        ]
    },
}  # end CATEGORIES

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} Visualizer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800">
  <div class="container mx-auto p-8">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold">{title}</h1>
      <p class="mt-2 text-gray-600">Placeholder page - Coming Soon</p>
    </header>
    <main class="text-center">
      <p>This visualization is not yet implemented.</p>
      <a href="../index.html" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">Back to Home</a>
    </main>
  </div>
</body>
</html>'''

if __name__ == '__main__':
    for cat_slug, cat_data in CATEGORIES.items():
        dir_path = os.path.join(BASE_DIR, cat_slug)
        os.makedirs(dir_path, exist_ok=True)
        for slug, title in cat_data['problems']:
            file_path = os.path.join(dir_path, slug)
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    f.write(TEMPLATE.format(title=title))
                print(f"Created {file_path}")
            else:
                print(f"Exists {file_path}")
